import {useState} from 'react'
import {makeStyles} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import ResultCard from "./ResultCard";
import {GenerationType, SamplerState} from "../Constants";

const useStyles = makeStyles({});

const ResultCards = ({socket, samplers, onSamplerChanged}) => {
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
        let sampler = samplers[samplerName];
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
            sampler.belongingTask.modelParams
        );
        onSamplerChanged();
    };

    const onStopGenerate = (samplerName) => {
        let sampler = samplers[samplerName];
        if (sampler.state !== SamplerState.running) {
            console.log(`WARN: Sampler ${samplerName} is in not in running state (${sampler.state}). Stop command ignored.`)
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
        if (sampler.belongingTask.generationType === GenerationType.continuation) {
            prompt = sampler.belongingTask.originalPrompt;
        }
        let text = sampler.generatedText;
        return (
            <Grid key={samplerName} item>
                <ResultCard
                    samplerName={samplerName}
                    mode={mode}
                    prompt={prompt}
                    text={text}
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
            {items}
            {/*
            <Grid item>
                <ResultCard mode="idle" text={"qwdqwdqwdqwd"}/>
            </Grid>
            <Grid item>
                <ResultCard mode="edit" text={"qwdqwdqwdqwd"}/>
            </Grid>
            <Grid item>
                <ResultCard mode="waiting" text={"qwdqwdqwdqwd"}/>
            </Grid>
            <Grid item>
                <ResultCard mode="running" text={"qwdqwdqwdqwd"}/>
            </Grid>
            <Grid item>
                <ResultCard mode="stopwait" text={"qwdqwdqwdqwd"}/>
            </Grid>
            */}
        </Grid>
    )
};

export default ResultCards;