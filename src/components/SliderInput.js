import {makeStyles} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Slider from "@material-ui/core/Slider";
import Input from "@material-ui/core/Input/Input";
import {useState} from "react";

const useStyles = makeStyles((theme) => ({
    slider: {
        paddingLeft: theme.spacing(0.5),
        paddingRight: theme.spacing(1)
    },
    numberInput: {
        width: 48
    }
}));

const SliderInput = ({min, max, step, initial, onChangesCommitted, onValidateInput}) => {
    const classes = useStyles();
    const [value, setValue] = useState(initial);
    return (
        <div className={classes.slider}>
            <Grid container spacing={2} direction="row" alignItems="center">
                <Grid item xs>
                    <Slider
                        value={typeof value === 'number' ? value : min}
                        valueLabelDisplay="auto"
                        step={step}
                        min={min}
                        max={max}
                        onChange={(event, value)=>{
                            setValue(value);
                        }}
                        onChangeCommitted={(event, value) => {
                            onChangesCommitted(value);
                        }}
                    />
                </Grid>
                <Grid item>
                    <Input
                        margin="dense"
                        className={classes.numberInput}
                        value={value}
                        onChange={(event)=>{
                            setValue(event.target.value === '' ? '' : Number(event.target.value));
                        }}
                        onBlur={()=>{
                            let validated = value;
                            if (typeof validated !== 'number') {
                                validated = min;
                            }
                            validated = onValidateInput(validated);
                            setValue(validated);
                            onChangesCommitted(validated);
                        }}
                        inputProps={{
                            step: step,
                            min: min,
                            max: max,
                            type: 'number'
                        }}
                    />
                </Grid>
            </Grid>
        </div>
    )
};

export default SliderInput;