import {useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import CreateIcon from '@material-ui/icons/Create';
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects';
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import {GenerationType} from "../Constants";

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
    generateButtonText:{
        marginRight: theme.spacing(1),
    },
    circularProgress:{
        marginLeft: theme.spacing(0.5),
    },
}));



const TextInput = ({wait, generationType, onTextSubmit}) => {
    const classes = useStyles();
    const [value, setValue] = useState("");
    // Low priority TODO: Support multiple promptTags
    // eslint-disable-next-line no-unused-vars
    const [promptTag, setPromptTag] = useState("[WP] ");

    const onSubmit = () => {
        if (value.trim()) {
            if (generationType === GenerationType.prompt) {
                onTextSubmit(value, promptTag);
            } else {
                onTextSubmit(value, "");
            }
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
            <Button
                disabled={wait || !value.trim()}
                color="primary"
                className={classes.iconButton}
                onClick={onSubmit}
            >
                <Typography variant="button" className={classes.generateButtonText}><b>Generate</b></Typography>
                {wait ? <CircularProgress className={classes.circularProgress} size={20}/> : (
                    generationType === GenerationType.prompt ? <EmojiObjectsIcon/> : <CreateIcon/>
                )}
            </Button>
        </Paper>
    )
};

export default TextInput;