import {useState} from 'react'
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Container from "@material-ui/core/Container";
import CreateIcon from '@material-ui/icons/Create';
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects';

const ModeSelector = () => {
    const [mode, setMode] = useState(0);

    const onModeChange = (event, newMode) => {
        setMode(newMode);
    };

    return (
        <Paper square>
            <Tabs
                value={mode}
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