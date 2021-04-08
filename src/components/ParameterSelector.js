import {makeStyles} from "@material-ui/core";
import {useState, useEffect} from 'react'
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import {GenerationType} from "../Constants";
import Slider from "@material-ui/core/Slider";
import SliderInput from "./SliderInput";

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(2)
    },
    slider: {
        paddingLeft: theme.spacing(0.5),
        paddingRight: theme.spacing(1)
    },
    selectorControl: {
        width: "100%",
    },
    captions: {
        maxWidth: 200
    }
}));

const getUsableModels = (generationType) => {
    switch (generationType) {
        case GenerationType.continuation:
            return (window.ModelConfig.continuationModels);
        case GenerationType.prompt:
            return (window.ModelConfig.promptModels);
        default:
            return ({});
    }
};

const maxGeneratedSequences = 5;
const generateSequenceMarks = [...Array(maxGeneratedSequences).keys()].map(x => {
    return {value: x + 1, label: (x + 1).toString()}
});

const ParameterSelector = ({generationType, parameters, onParametersChanged}) => {
    const classes = useStyles();
    const [usableModels, setUsableModels] = useState(getUsableModels(generationType));
    const [model, setModel] = useState("gpt2");
    const [params, setParams] = useState(parameters);
    const [initialMaxLength, setInitialMaxLength] = useState(20);
    const [initialMinLength, setInitialMinLength] = useState(10);
    const [generateSequenceCount, setGenerateSequenceCount] = useState(5);

    const onModelChange = (event) => {
        setModel(event.target.value);
    };

    /* Triggered when parameters changes */
    useEffect(()=> {
        setParams(parameters);
    }, [parameters]);

    /* Triggered when generationType changes */
    useEffect(() => {
        /* Change usableModels when generationType changes  */
        let usableModels = getUsableModels(generationType);
        setUsableModels(usableModels);
        setModel(usableModels[Object.keys(usableModels)[0]]);
    }, [generationType]);

    /* Triggered when any parameters in the selector changes */
    useEffect(() => {
        /* Update parameters */
        onParametersChanged(model, params, initialMinLength, initialMaxLength, generateSequenceCount);
    }, [onParametersChanged, model, params, initialMinLength, initialMaxLength, generateSequenceCount]);

    return (
        <Grid container spacing={2} direction="column" alignItems="stretch">
            <Grid item>
                <Paper className={classes.paper}>
                    <Typography variant="h5" component="h2" align="left">
                        Parameters
                    </Typography>
                    <Typography variant="caption" display="block" align="justify" color={"textSecondary"}
                                className={classes.captions} gutterBottom>
                        Apply only to new stories
                    </Typography>
                    <Grid container spacing={2} direction="column" alignItems="stretch" className={classes.root}>
                        <Grid item>
                            <Typography variant="body2" align="left">
                                Model to Use:
                            </Typography>
                            <FormControl className={classes.selectorControl}>
                                <Select
                                    value={model}
                                    onChange={onModelChange}
                                >
                                    {Object.keys(usableModels).map(display_name => {
                                        return (
                                            <MenuItem
                                                key={display_name + usableModels[display_name]}
                                                value={usableModels[display_name]}
                                            >
                                                {display_name}
                                            </MenuItem>
                                        )
                                    })}
                                </Select>
                                <FormHelperText>Select a model to generate text</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <Typography variant="body2" align="left">
                                Temperature:
                            </Typography>
                            <Typography variant="caption" display="block" align="justify" color={"textSecondary"}
                                        className={classes.captions} gutterBottom>
                                The probability distribution is multiplied by the inverse of this value before sampling.
                                Lowering the value produces more coherent results.
                                Increasing the value reduces repetition.
                            </Typography>
                            <SliderInput
                                min={0.5}
                                max={1.5}
                                initial={
                                    (typeof params['temperature'] !== "undefined") ? params['temperature'] : 1
                                }
                                step={0.01}
                                onChangesCommitted={(value) => {
                                    setParams({...params, 'temperature': value})
                                }}
                                onValidateInput={(value) => {
                                    if (value < 0.001) {
                                        return 0.01
                                    } else if (value >= 3) {
                                        return 3
                                    } else {
                                        return value
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item>
                            <Typography variant="body2" align="left">
                                Top-p Sampling:
                            </Typography>
                            <Typography variant="caption" display="block" align="justify" color={"textSecondary"}
                                        className={classes.captions} gutterBottom>
                                Nucleus sampling, select the
                                least amount of tokens that
                                combines to a probability of p.
                                Set 1 to disable top p sampling.
                            </Typography>
                            <SliderInput
                                min={0.01}
                                max={1}
                                initial={(typeof params['top_p'] !== "undefined") ? params['top_p'] : 1}
                                step={0.01}
                                onChangesCommitted={(value) => {
                                    setParams({...params, 'top_p': value})
                                }}
                                onValidateInput={(value) => {
                                    if (value < 0.001) {
                                        return 0.01
                                    } else if (value >= 1) {
                                        return 1
                                    } else {
                                        return value
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item>
                            <Typography variant="body2" align="left">
                                Top-k Sampling:
                            </Typography>
                            <Typography variant="caption" display="block" align="justify" color={"textSecondary"}
                                        className={classes.captions} gutterBottom>
                                Select at most k tokens only
                                Set 1 for greedy sampling.
                                Set 0 to disable top k sampling
                                which selects unlimited tokens.
                            </Typography>
                            <SliderInput
                                min={0}
                                max={200}
                                initial={(typeof params['top_k'] !== "undefined") ? params['top_k'] : 0}
                                step={1}
                                onChangesCommitted={(value) => {
                                    setParams({...params, 'top_k': value})
                                }}
                                onValidateInput={(value) => {
                                    value = Math.round(value);
                                    if (value < 0) {
                                        return 0;
                                    } else {
                                        return value;
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
            <Grid item>
                <Paper className={classes.paper}>
                    <Typography variant="h5" component="h2" gutterBottom align="left">
                        Options
                    </Typography>
                    <Grid container spacing={2} direction="column" alignItems="stretch" className={classes.root}>
                        <Grid item>
                            <Typography variant="body2" align="left">
                                Stories to Generate:
                            </Typography>
                            <Typography variant="caption" display="block" align="justify" color={"textSecondary"}
                                        className={classes.captions} gutterBottom>
                                Each time you click "Generate"
                            </Typography>
                            <div className={classes.slider}>
                                <Slider
                                    defaultValue={5}
                                    valueLabelDisplay="auto"
                                    step={1}
                                    marks={generateSequenceMarks}
                                    min={1}
                                    max={maxGeneratedSequences}
                                    onChangeCommitted={(event, value) => {
                                        setGenerateSequenceCount(value);
                                    }}
                                />
                            </div>
                        </Grid>
                        <Grid item>
                            <Typography variant="body2" align="left">
                                Minimum Length:
                            </Typography>
                            <Typography variant="caption" display="block" align="justify" color={"textSecondary"}
                                        className={classes.captions} gutterBottom>
                                Generate at least {initialMinLength} tokens long
                            </Typography>
                            <div className={classes.slider}>
                                <Slider
                                    defaultValue={10}
                                    valueLabelDisplay="auto"
                                    step={1}
                                    min={1}
                                    max={30}
                                    onChangeCommitted={(event, value) => {
                                        setInitialMinLength(value);
                                    }}
                                />
                            </div>
                        </Grid>
                        <Grid item>
                            <Typography variant="body2" align="left">
                                Pausing Length:
                            </Typography>
                            <Typography variant="caption" display="block" align="justify" color={"textSecondary"}
                                        className={classes.captions} gutterBottom>
                                Generate at most {initialMaxLength} tokens before requiring "Generate More"
                            </Typography>
                            <div className={classes.slider}>
                                <Slider
                                    defaultValue={20}
                                    valueLabelDisplay="auto"
                                    step={1}
                                    min={1}
                                    max={50}
                                    onChangeCommitted={(event, value) => {
                                        setInitialMaxLength(value);
                                    }}
                                />
                            </div>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        </Grid>
    )
};

export default ParameterSelector;