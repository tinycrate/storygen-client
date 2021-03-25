import {makeStyles} from "@material-ui/core";
import {useState, useEffect} from 'react'
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import {GenerationType} from "../Constants";

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(2)
    }
}));

const getUsableModels = (generationType) => {
    switch (generationType) {
        case GenerationType.continuation:
            return(window.ModelConfig.continuationModels);
        case GenerationType.prompt:
            return(window.ModelConfig.promptModels);
        default:
            return({});
    }
};

const ParameterSelector = ({generationType, parameters, onParameterChanged: onParametersChanged}) => {
    const classes = useStyles();
    const [usableModels, setUsableModels] = useState(getUsableModels(generationType));
    const [model, setModel] = useState("gpt2");
    const [params, setParams] = useState({});
    const [initialMaxLength, setInitialMaxLength] = useState(20);
    const [initialMinLength, setInitialMinLength] = useState(10);

    const onModelChange = (event) => {
        setModel(event.target.value);
    };

    /* Triggered when generationType changes */
    useEffect(()=>{
        /* Change usableModels when generationType changes  */
        let usableModels = getUsableModels(generationType);
        setUsableModels(usableModels);
        setModel(usableModels[Object.keys(usableModels)[0]]);
    }, [generationType]);

    /* Triggered when any parameters in the selector changes */
    useEffect(()=>{
        /* Update parameters */
        onParametersChanged(model, params, initialMinLength, initialMaxLength);
    }, [onParametersChanged, model, params, initialMinLength, initialMaxLength]);

    return (
        <Paper className={classes.paper}>
            <Typography variant="h5" component="h2" gutterBottom>
                Parameters
            </Typography>
            <Grid container spacing={2} direction="column" alignItems="center" className={classes.root}>
                <Grid item>
                    <FormControl>
                        <InputLabel id="model-label">Model</InputLabel>
                        <Select
                            labelId="model-label"
                            id="model"
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
            </Grid>
        </Paper>
    )
};

export default ParameterSelector;