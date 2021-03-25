import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import CreateIcon from '@material-ui/icons/Create';
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects';
import {GenerationType} from "../Constants";

const TabModes = [GenerationType.continuation, GenerationType.prompt];

const ModeSelector = ({mode, onModeChanged}) => {

    const onModeChange = (event, newMode) => {
        onModeChanged(TabModes[newMode]);
    };

    return (
        <Paper square>
            <Tabs
                value={TabModes.indexOf(mode)}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                onChange={onModeChange}
            >
                <Tab label={<><CreateIcon />Continue Story</>} />
                <Tab label={<><EmojiObjectsIcon />Writing Prompt</>} />
            </Tabs>
        </Paper>
    )
}

export default ModeSelector;