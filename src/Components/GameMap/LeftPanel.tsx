import { Box, Button, Paper, ToggleButtonGroup, ToggleButton, ButtonGroup, Switch, Tooltip } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LandscapeIcon from '@mui/icons-material/Landscape';
import GroupIcon from '@mui/icons-material/Group';
import StraightenIcon from '@mui/icons-material/Straighten';
import { ShapeLine } from '@mui/icons-material';

interface LeftPanelProps {
  layer: string
  setLayer : React.Dispatch<React.SetStateAction<string>>
  setAddPawnDialogOpen : React.Dispatch<React.SetStateAction<boolean>>
  setObstacleDialogOpen : React.Dispatch<React.SetStateAction<boolean>>
  tool: string
  setTool : React.Dispatch<React.SetStateAction<string>>
  isInitiative : boolean
  setIsInitiative : React.Dispatch<React.SetStateAction<boolean>>
  isFog : boolean
  setIsFog : React.Dispatch<React.SetStateAction<boolean>>
}

const LeftPanel : React.FC<LeftPanelProps> = ({
  layer,
  setLayer,
  setAddPawnDialogOpen,
  setObstacleDialogOpen,
  tool,
  setTool,
  isInitiative,
  setIsInitiative,
  isFog,
  setIsFog,
}) =>{
  const openAddPawnDialog = () => setAddPawnDialogOpen(true);
  const openObstacleDialog = () => setObstacleDialogOpen(true);
  
  const handleTool = (_event: React.MouseEvent<HTMLElement>, nextTool: string) => {
    if (nextTool != null)
      setTool(nextTool);
  };

  const handleInitiative = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsInitiative(event.target.checked);
  };

  const handleFog = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsFog(event.target.checked);
  };

  const handleLayer = (_event: React.MouseEvent<HTMLElement>, nextLayer: string) => {
    if (nextLayer != null)
      setLayer(nextLayer);
  };
  
  return (
    <Paper
    sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'absolute',
        height: '98vh',
        width: 70,
        zIndex: 10,
        borderRadius: "20px",
        backgroundColor: 'rgba(130, 255, 255, 0.3)',
        backdropFilter: 'blur(5px)',
        alignItems: 'center',
        justifyContent: 'space-between',
        
    }}>
      {layer === 'token' && (
        <Button onClick={openAddPawnDialog} variant='outlined' sx={{
          height: 50,
          width: 50,
        }}>
          <PersonAddIcon/>
        </Button>

      )}

      {layer === 'obstacle' && (
        <ButtonGroup>
          <Button onClick={openObstacleDialog} variant='outlined'>
            <ShapeLine/>
          </Button>
        </ButtonGroup>
      )}

      {layer === 'map' && (
        <ButtonGroup>

        </ButtonGroup>
      )}
    {layer === 'token' && (
      <ToggleButtonGroup
      orientation='vertical'
        color='primary'
        value={tool}
        exclusive
        onChange={handleTool}>
        <ToggleButton value={'token'}>
          <GroupIcon/>
        </ToggleButton>
        <ToggleButton value={'measure'}>
          <StraightenIcon/>
        </ToggleButton>
      </ToggleButtonGroup>
    )}
    <Box
    sx={{
      width: 50,
      marginBottom: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }}>
      <Tooltip title="initiative" placement='right' arrow>
        <Switch
          checked={isInitiative}
          onChange={handleInitiative}
          inputProps={{'aria-label': 'controlled'}}
        />
      </Tooltip>
      <Tooltip title="fog of war" placement='right' arrow>
        <Switch
          checked={isFog}
          onChange={handleFog}
          inputProps={{'aria-label': 'controlled'}}
        />
      </Tooltip>
      <ToggleButtonGroup
        orientation='vertical'
        color='primary'
        value={layer}
        exclusive
        onChange={handleLayer}
      >
        <ToggleButton value='token' aria-label='token layer'>
          <PersonIcon/>
        </ToggleButton>
        <ToggleButton value='obstacle' aria-label='obstacle layer'>
          <LandscapeIcon/>
        </ToggleButton>
        <ToggleButton value='map' aria-label='map layer'>
          <MapIcon/>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  </Paper>
  );
};
export default LeftPanel;