import {useState} from 'react'
import {makeStyles} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import ResultCard from "./ResultCard";
import {GenerationType, SamplerState} from "../Constants";
import Slide from "@material-ui/core/Slide/Slide";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(2)
    },
    h3: {
        marginTop: 16
    },
    li: {
        marginBottom: 10
    }
}));

const ResultCards = ({samplers, onSamplerChanged, onStartGenerate, onModelParametersPresetChanged}) => {
    // eslint-disable-next-line no-unused-vars
    const classes = useStyles();
    const [editModeSamplers, setEditModeSamplers] = useState(new Set());

    const onEditModeChange = (samplerName, editModeEnabled) => {
        let newSet = new Set(editModeSamplers);
        if (editModeEnabled) {
            newSet.add(samplerName);
        } else {
            newSet.delete(samplerName);
        }
        setEditModeSamplers(newSet);
    };

    const onEditText = (samplerName, text) => {
        samplers[samplerName].generatedText = text;
        onEditModeChange(samplerName, false);
        onSamplerChanged();
    };

    const onGenerate = (samplerName) => {
        onStartGenerate(samplerName);
    };

    const onStopGenerate = (samplerName) => {
        let sampler = samplers[samplerName];
        if (sampler.state !== SamplerState.running) {
            console.log(
                `WARN: Sampler ${samplerName} is in not in running state (${sampler.state}). Stop command ignored.`
            );
            return
        }
        samplers[samplerName].state = SamplerState.stopwait;
        onSamplerChanged();
    };

    const items = Object.keys(samplers).slice(0).reverse().map(samplerName => {
        let sampler = samplers[samplerName];
        let mode = "";
        if (sampler.state === SamplerState.stopped) {
            if (editModeSamplers.has(sampler.id)) {
                mode = "edit";
            } else {
                mode = "idle";
            }
        } else {
            mode = sampler.state;
        }
        let prompt = "";
        if (sampler.belongingTask.generationType === GenerationType.prompt) {
            prompt = sampler.belongingTask.originalPrompt;
        }
        let text = sampler.generatedText;
        let params = sampler.belongingTask.modelParams;
        let model = sampler.belongingTask.modelName;
        return (
            <Grid key={samplerName} item>
                <ResultCard
                    samplerName={samplerName}
                    mode={mode}
                    prompt={prompt}
                    text={text}
                    model={model}
                    params={params}
                    onEditModeChange={onEditModeChange}
                    onEditText={onEditText}
                    onGenerate={onGenerate}
                    onStopGenerate={onStopGenerate}
                />
            </Grid>
        )
    });
    return (
        <Grid container spacing={2} direction="column" alignItems="stretch">
            <Slide direction="left" in={items.length <= 0} unmountOnExit appear={false}>
                <Grid item>
                    <Paper className={classes.paper}>
                        <Typography variant="h5" component="h2" align="left" gutterBottom>
                            Quick Start Guide
                        </Typography>
                        <Divider orientation={'horizontal'}/>
                        <Typography variant="body1" component="span">
                            <ol>
                                <li>Select a model of your choice in the Parameters menu</li>
                                <li>Enter some text in the textbox above</li>
                                <li>Click <b>Generate</b></li>
                                <li>Find a story that interests you and click <b>Generate More</b></li>
                                <li>
                                    Stop and Resume the generation or <b>Edit</b> the output before resuming.
                                </li>
                            </ol>
                        </Typography>
                    </Paper>
                </Grid>
            </Slide>
            <Slide direction="left" in={items.length <= 0} unmountOnExit appear={false}>
                <Grid item>
                    <Paper className={classes.paper}>
                        <Typography variant="h5" component="h2" align="left" gutterBottom>
                            Tips and Tricks
                        </Typography>
                        <Divider orientation={'horizontal'}/>
                        <Typography variant="body1" component="span">
                            <Typography variant="h6" component="h3" align="left" className={classes.h3}>
                                Model Parameters
                            </Typography>
                            <ul>
                                <li className={classes.li}>
                                    The default configuration does not filter any tokens before sampling, which
                                    could lead to infrequent / non-related words being generated by a low chance.
                                    You should experiment with <b>top-k/top-p</b> sampling methods by changing the
                                    values in the Parameters menu.
                                </li>
                                <li className={classes.li}>
                                    To start off, we recommend trying the simplest <button onClick={() => {
                                    onModelParametersPresetChanged("top-k=50", {'top_k': 50});
                                }}>top-k=50</button> filtering. Clicking the button will set the sampler to sample only
                                    the top 50 most likely tokens from the model's probability distribution. This will
                                    replace your current settings.
                                </li>
                                <li className={classes.li}>
                                    You can also try mixing sampling methods. If both top-k and top-p sampling is set,
                                    top-p filtering will first be applied. If the remaining number of token exceeds
                                    top-k, the least likely tokens will be filtered so that the number of remaining
                                    tokens is equal or less than k.
                                </li>
                                <li>
                                    You can also try tweaking the temperature value to control the probability
                                    distribution. Lowering the temperature further increase the chance of
                                    high-probability tokens to be generated while increasing the value increases the
                                    chances of low-probability tokens to be generated. If you find the model produce
                                    incoherent results, try reducing the value. If you find the model produce repetitive
                                    results, try increasing the value.
                                </li>
                            </ul>
                            <Typography variant="h6" component="h3" align="left" className={classes.h3}>
                                Generation Types
                            </Typography>
                            <p>You can set the generation type on the top of the page. There are currently 2 modes:</p>
                            <ul>
                                <li className={classes.li}>
                                    <b>Continue Story:</b> The model tries you continue writing from the text you have
                                    inputted in the textbox.
                                </li>
                                <li className={classes.li}>
                                    <b>Writing Prompt:</b> The model tries to write you a story based on the context
                                    given in the textbox. You can try something like <u>Scientists have discovered the
                                    most deadly material</u> instead of thinking for a story opening.
                                </li>
                            </ul>
                        </Typography>
                    </Paper>
                </Grid>
            </Slide>
            {items}
            {/* Uncomment to see all styles of the ResultCard
            <Grid item>
                <ResultCard mode="idle" text={"Sample Text"}/>
            </Grid>
            <Grid item>
                <ResultCard mode="edit" text={"Sample Text"}/>
            </Grid>
            <Grid item>
                <ResultCard mode="waiting" text={"Sample Text"}/>
            </Grid>
            <Grid item>
                <ResultCard mode="running" text={"Sample Text"}/>
            </Grid>
            <Grid item>
                <ResultCard mode="stopwait" text={"Sample Text"}/>
            </Grid>
            */}
        </Grid>
    )
};

export default ResultCards;