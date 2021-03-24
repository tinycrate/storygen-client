import {useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import CreateIcon from '@material-ui/icons/Create';
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        flex: 1,
    },
    input: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },
    iconButton: {
        padding: 10,
    },
    divider: {
        height: 28,
        margin: 4,
    },
}));



const TextInput = ({wait, onTextSubmit}) => {
    const classes = useStyles();
    const [value, setValue] = useState("");

    const onSubmit = () => {
        if (value) {
            onTextSubmit(value);
        }
    };

    const onChange = (event) => {
        setValue(event.target.value);
    };

    return (
        <Paper component="form" className={classes.root}>
            <InputBase
                multiline
                className={classes.input}
                placeholder="Enter some text here..."
                onChange={onChange}
            />
            <Divider className={classes.divider} orientation="vertical"/>
            <IconButton
                disabled={wait}
                color="primary"
                className={classes.iconButton}
                aria-label="directions"
                onClick={onSubmit}
            >
                {wait ? <CircularProgress size={24}/> : <CreateIcon/>}
            </IconButton>
        </Paper>
    )
};

export default TextInput;