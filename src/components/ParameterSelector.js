import {makeStyles} from "@material-ui/core";
import {useState} from 'react'
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(2)
    }
}));

const ParameterSelector = () => {
    const classes = useStyles();
    const [model, setModel] = useState('');

    const OnModelChange = (event) => {
        setModel(event.target.value);
    };

    const SelectorModel = () => <FormControl>
        <InputLabel id="model-label">Model</InputLabel>
        <Select
            labelId="model-label"
            id="model"
            value={model}
            onChange={OnModelChange}
        >
            <MenuItem value={10}>Ten</MenuItem>
            <MenuItem value={20}>Twenty</MenuItem>
            <MenuItem value={30}>Thirty</MenuItem>
        </Select>
        <FormHelperText>Select a model to generate text</FormHelperText>
    </FormControl>;

    return (
        <Paper className={classes.paper}>
            <Typography variant="h5" component="h2" gutterBottom>
                Parameters
            </Typography>
            <Grid container spacing={2} direction="column" alignItems="center" className={classes.root}>
                <Grid item><SelectorModel/></Grid>
            </Grid>
        </Paper>
    )
};

export default ParameterSelector;