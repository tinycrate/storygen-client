import {useState} from 'react'
import {makeStyles} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import PropTypes from 'prop-types';
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Divider from "@material-ui/core/Divider";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles({
    textField: {
        width: "100%"
    },
});

const ResultCard = ({samplerName, mode, prompt, text, onEditModeChange, onEditText, onGenerate, onStopGenerate}) => {
    const classes = useStyles();
    const [editText, setEditText] = useState(text);

    let textRenderArea, cardActions;

    const onEditClicked = () => {
        onEditModeChange(samplerName, true);
    };

    const onCancelEditClicked = () => {
        onEditModeChange(samplerName, false);
    };

    const onEditTextChange = (event) => {
        setEditText(event.target.value);
    };

    const onEditConfirm = () => {
        onEditText(samplerName, editText);
    };

    const onGenerateClick = () => {
        onGenerate(samplerName);
    };

    const onStopGenerateClick = () => {
        onStopGenerate(samplerName);
    };

    switch (mode) {
        case 'edit':
            textRenderArea = <TextField
                className={classes.textField}
                defaultValue={text}
                onChange={onEditTextChange}
                multiline
            />;
            cardActions = <CardActions>
                <Button size="small" color="primary" onClick={onEditConfirm}><b>Confirm</b></Button>
                <Button size="small" color="primary" onClick={onCancelEditClicked}><b>Cancel</b></Button>
            </CardActions>;
            break;
        case 'idle':
            textRenderArea = <Typography variant="body1" align="left">{text}</Typography>;
            cardActions = <CardActions>
                <Button size="small" color="primary" onClick={onGenerateClick}><b>Generate More</b></Button>
                <Button size="small" color="primary" onClick={onEditClicked}><b>Edit</b></Button>
            </CardActions>;
            break;
        case 'waiting':
            textRenderArea = <Typography variant="body1" align="left">{text}</Typography>;
            cardActions = <CardActions>
                <Button disabled size="small" color="primary"><b>Generate More</b></Button>
                <CircularProgress size={20}/>
            </CardActions>;
            break;
        case 'running':
            textRenderArea = <Typography variant="body1" align="left">{text}</Typography>;
            cardActions = <CardActions>
                <Button size="small" color="secondary" onClick={onStopGenerateClick}><b>Stop Generation</b></Button>
            </CardActions>;
            break;
        case 'stopwait':
            textRenderArea = <Typography variant="body1" align="left">{text}</Typography>;
            cardActions = <CardActions>
                <Button disabled size="small" color="secondary"><b>Stop Generation</b></Button>
                <CircularProgress size={20}/>
            </CardActions>;
            break;
        default:
            break;
    }
    return (
        <Card>
            <CardContent>
                <Typography variant="body2" align="left" color="textSecondary">
                    Story {samplerName}: {prompt}
                </Typography>
                {textRenderArea}
            </CardContent>
            <Divider orientation={'horizontal'}/>
            {cardActions}
        </Card>
    )
};

ResultCard.defaultProps = {
    editMode: false,
    text: '',
};

ResultCard.propTypes = {
    editMode: PropTypes.bool,
    text: PropTypes.string,
};

export default ResultCard;