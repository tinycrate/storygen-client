import ModeSelector from './components/ModeSelector'
import TextInput from "./components/TextInput";
import {makeStyles} from "@material-ui/core";
import {useState, useEffect, useCallback} from 'react'
import {io} from "socket.io-client"
import Box from '@material-ui/core/Box';
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import ParameterSelector from "./components/ParameterSelector";
import ResultCards from "./components/ResultCards";
import 'fontsource-roboto';
import {GenerationType, SamplerState} from "./Constants";
import {useSnackbar} from 'notistack';
import LinearProgress from "@material-ui/core/LinearProgress/LinearProgress";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import Fade from "@material-ui/core/Fade";

class Task {
    static tasksCreated = 0;
    static tasks = {};

    static get_new_id() {
        return `T${++Task.tasksCreated}`
    }

    static new_continuation_task(modelName, prefix, model_params) {
        let new_task = new Task();
        new_task.id = Task.get_new_id();
        new_task.modelName = modelName;
        new_task.generationType = GenerationType.continuation;
        // The prefix to be sent to the model before generatedText
        // In a continuation task, prefix is used once only and cleared on subsequent sampling
        // since only generatedText is needed to be sent to the model
        new_task.prefix = prefix;
        new_task.modelParams = model_params;
        Task.tasks[new_task.id] = new_task;
        return new_task;
    }

    static new_prompt_task(modelName, originalPrompt, prefix, model_params) {
        let new_task = new Task();
        new_task.id = Task.get_new_id();
        new_task.modelName = modelName;
        new_task.generationType = GenerationType.prompt;
        new_task.originalPrompt = originalPrompt; // The prompt that the user has inputted, for display only
        new_task.prefix = prefix; // The prefix to be sent to the model before generatedText
        new_task.modelParams = model_params;
        Task.tasks[new_task.id] = new_task;
        return new_task;
    }
}

class Sampler {
    static samplersCreated = 0;
    static samplers = {};

    static get_new_id() {
        return `#${++Sampler.samplersCreated}`
    }

    static create_sampler(belonging_task) {
        let new_sampler = new Sampler();
        new_sampler.id = Sampler.get_new_id();
        // The task that the story belongs to, contains necessary information for sampling
        new_sampler.belongingTask = belonging_task;
        // Results returned by the sampler is stored here
        new_sampler.generatedText = "";
        // Status of the sampler
        new_sampler.state = SamplerState.stopped;
        Sampler.samplers[new_sampler.id] = new_sampler;
        return new_sampler;
    }
}

const useStyles = makeStyles((theme) => ({
    grid: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2)
    },
    initMsgBox: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        textAlign: 'left'
    }
}));

let disconnectedSnackBar = null;

function App() {
    const [socket, setSocket] = useState(null);
    const [samplers, setSamplers] = useState({});
    const [waitingTask, setWaitingTask] = useState(null);
    const [parameters, setParameters] = useState({});
    const [modelName, setModelName] = useState("gpt2");
    const [generationType, setGenerationType] = useState(GenerationType.continuation);
    const [initialMaxLength, setInitialMaxLength] = useState(20);
    const [initialMinLength, setInitialMinLength] = useState(10);
    const [generateSequenceCount, setGenerateSequenceCount] = useState(5);
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();

    const onGenerateCompleted = (task_name, results) => {
        let task = Task.tasks[task_name];
        for (let result in results) {
            let sampler = Sampler.create_sampler(task);
            if (results.hasOwnProperty(result)) {
                sampler.generatedText = results[result];
                // We add the prefix to generatedText for continuation task as it is the part of the story
                if (task.generationType === GenerationType.continuation) {
                    sampler.generatedText = task.prefix + sampler.generatedText;
                }
            }
        }
        if (task.generationType === GenerationType.continuation) {
            // Since we have added the prefix as part of the generatedText, we no longer need it in continuation tasks
            task.prefix = "";
        }
        setWaitingTask(null);
        setSamplers({...Sampler.samplers});
    };

    const onText = (sampler_name, sampled_text, callback) => {
        Sampler.samplers[sampler_name].generatedText += sampled_text;
        switch (Sampler.samplers[sampler_name].state) {
            case SamplerState.waiting:
                callback(true);
                Sampler.samplers[sampler_name].state = SamplerState.running;
                break;
            case SamplerState.running:
                callback(true);
                break;
            case SamplerState.stopwait:
                callback(false);
                Sampler.samplers[sampler_name].state = SamplerState.stopped;
                break;
            default:
                callback(false);
                Sampler.samplers[sampler_name].state = SamplerState.stopped;
                console.log(`WARN: Sampler ${sampler_name} in wrong state. Forcefully setting it to stopped state.`);
        }
        setSamplers({...Sampler.samplers});
    };

    const onTextSampleCompleted = (sampler_name) => {
        Sampler.samplers[sampler_name].state = SamplerState.stopped;
        setSamplers({...Sampler.samplers});
    };

    const onDisconnect = (reason) => {
        console.log(`[NET] Disconnected from server: ${reason}. Cleaning up...`);
        for (let sampler_name in Sampler.samplers) {
            if (Sampler.samplers.hasOwnProperty(sampler_name)) {
                Sampler.samplers[sampler_name].state = SamplerState.stopped;
            }
        }
        setWaitingTask(null);
        setSocket(null);
        setSamplers({...Sampler.samplers});
        if (disconnectedSnackBar === null) {
            disconnectedSnackBar = enqueueSnackbar(
                "Disconnected. Reconnecting...", {variant: 'warning', autoHideDuration: null}
            );
        }
    };

    const onParametersChanged = useCallback(
        (modelName, parameters, initialMinLength, initialMaxLength, generateSequenceCount) => {
            setModelName(modelName);
            // Caller should create a new object if parameters are meant to be changed
            setParameters(parameters);
            setInitialMinLength(initialMinLength);
            setInitialMaxLength(initialMaxLength);
            setGenerateSequenceCount(generateSequenceCount);
        }, []);

    const onSamplerChanged = () => {
        setSamplers({...Sampler.samplers});
    };

    const onTextSubmit = (text, promptTag) => {
        let task;
        if (generationType === GenerationType.continuation) {
            task = Task.new_continuation_task(modelName, text, parameters);
        } else if (generationType === GenerationType.prompt) {
            let prompt = promptTag + text;
            task = Task.new_prompt_task(modelName, prompt, `<|endoftext|>${prompt} [RESPONSE] `, parameters);
        }
        setWaitingTask(task.id);
        socket.emit(
            'generate_text',
            task.id,
            task.modelName,
            task.prefix,
            initialMaxLength,
            {...parameters, 'min_length': initialMinLength},
            generateSequenceCount
        )
    };

    const onStartGenerate = (samplerName) => {
        let sampler = Sampler.samplers[samplerName];
        if (sampler.state !== SamplerState.stopped) {
            console.log(`WARN: Sampler ${samplerName} is in not in stopped state (${sampler.state}). Generate command ignored.`)
            return
        }
        sampler.state = SamplerState.waiting;
        socket.emit(
            'start_new_sampler',
            samplerName,
            sampler.belongingTask.modelName,
            sampler.belongingTask.prefix + sampler.generatedText,
            {...sampler.belongingTask.modelParams, 'min_length': initialMinLength}
        );
        setSamplers({...Sampler.samplers});
    };

    useEffect(() => {
        // componentDidMount
        let socket;
        if (window.APILocation) {
            socket = io(window.APILocation);
        } else {
            // If no API location specified, it defaults to the same as the web server
            socket = io();
        }
        socket.on("on_generate_completed", onGenerateCompleted);
        socket.on("on_text", onText);
        socket.on("on_text_sample_completed", onTextSampleCompleted);
        socket.on("disconnect", onDisconnect);
        socket.on("connect", () => {
            console.log(`[NET] Connected to server.`);
            setSocket(socket);
            if (disconnectedSnackBar != null) {
                closeSnackbar(disconnectedSnackBar);
                disconnectedSnackBar = null;
            }
            enqueueSnackbar("Connected!", {variant: 'success'});
        });
        if (disconnectedSnackBar === null) {
            disconnectedSnackBar = enqueueSnackbar(
                "Connecting to inference API...",
                {variant: 'default', transitionDuration: {enter: 1, exit: 136}, autoHideDuration: null}
            );
        }
        // We want to execute once only and we understand that all function will get stale values which is fine
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        console.log("[INFO] Selected model:", modelName);
    }, [modelName]);

    useEffect(() => {
        console.log("[INFO] Parameters selected: ", parameters);
    }, [parameters]);

    useEffect(() => {
        console.log(
            "[INFO] Generate options changed: Type:", generationType,
            "MinLength:", initialMinLength,
            "MaxLength:", initialMaxLength,
            "SequenceCount:", generateSequenceCount
        )
    }, [generationType, initialMinLength, initialMaxLength, generateSequenceCount]);

    const classes = useStyles();
    return (
        <div className="App">
            <h1> Creative Story Generator Using GPT-2 </h1>
            <Container maxWidth="xs">
                <ModeSelector mode={generationType} onModeChanged={(newMode) => setGenerationType(newMode)}/>
            </Container>
            <Container>
                <Box p={2}>
                    <TextInput
                        wait={socket == null || waitingTask != null}
                        generationType={generationType}
                        onTextSubmit={onTextSubmit}
                    />
                    {socket != null && waitingTask != null && <LinearProgress/>}
                </Box>
            </Container>
            {socket != null && waitingTask != null &&
            <Fade in={socket != null && waitingTask != null}>
                <Container>
                    <Box className={classes.initMsgBox}>
                        <Alert severity="success">
                            <AlertTitle><strong>Initializing Model...</strong></AlertTitle>
                            This could take up to 10 seconds when changing models. Subsequent generation will be
                            significantly faster.
                        </Alert>
                    </Box>
                </Container>
            </Fade>
            }
            <Container>
                <Grid container spacing={2} className={classes.grid}>
                    <Grid item>
                        <ParameterSelector
                            generationType={generationType}
                            parameters={parameters}
                            onParametersChanged={onParametersChanged}
                        />
                    </Grid>
                    <Grid item xs>
                        <ResultCards
                            samplers={samplers}
                            onSamplerChanged={onSamplerChanged}
                            onStartGenerate={onStartGenerate}
                            onModelParametersPresetChanged={(presetName, params) => {
                                setParameters(params);
                                enqueueSnackbar(`Preset applied: ${presetName}`, {
                                    variant: 'info',
                                    preventDuplicate: true
                                })
                            }}
                        />
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
}

export default App;
