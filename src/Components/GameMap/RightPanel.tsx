import Grid from '@mui/material/Grid2';
import { Box, List, IconButton, ListItemText, Typography, Button, Paper, TextField, ToggleButtonGroup, ToggleButton, InputAdornment, ListItemButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import { InitiativeListItem, Pawn, GameData } from '../types.ts';
import PawnController from './PawnController.ts';

interface RightPanelProps {
  pawns: Pawn[];
  setPawns: React.Dispatch<React.SetStateAction<Pawn[]>>;
  API_URL: string;
  game: GameData;
  selectedPawnIndex: number | null;
  initiativeList: InitiativeListItem[];
  setInitiativeList: React.Dispatch<React.SetStateAction<InitiativeListItem[]>>;
  currentTurn: string;
  setCurrentTurn: React.Dispatch<React.SetStateAction<string>>;
  isInitiative: boolean;
  pawnController: PawnController;
  hoveredPawnIndex: number | null;
}

const RightPanel: React.FC<RightPanelProps> = ({
  pawns,
  setPawns,
  API_URL,
  game,
  selectedPawnIndex,
  initiativeList,
  setInitiativeList,
  currentTurn,
  setCurrentTurn,
  isInitiative,
  pawnController,
  hoveredPawnIndex,
}) => {

  const handleStatChange = async (stat: keyof Pawn, value: number, index: number) => {
    setPawns((prevPawns) => {
      const updatedPawns = [...prevPawns];
      updatedPawns[index] = {
        ...updatedPawns[index],
        [stat]: value,
      };
      return updatedPawns;
    });
    console.log(JSON.stringify({ [stat]: value }));
    try {
      const response = await fetch(`${API_URL}/${game.id}/pawns/modify-pawn/${pawns[index].id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [stat]: value }),
      });
      if (!response.ok) {
        throw new Error("Failed to update pawn");
      }
    } catch (error) {
      console.error("Error updating pawn:", error);
    }
  };

  const handlePawnController = (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>, pawnName: string) => {
    const selectedPawn = pawns.find(p => p.pawn_name === pawnName);
    if (selectedPawn) {
      pawnController.handleAutoMode(selectedPawn);
    } else
        console.log(`Pawn with name ${pawnName} not found.`);
  }

  const handleCurrentInitiative = ( _event: React.MouseEvent<HTMLButtonElement, MouseEvent>, next: string) => {
    setInitiativeList((prevList) => {
      const currentIndex = prevList.findIndex(pawn => pawn.name === currentTurn);
      let nextIndex: number;
      if (next === "bottom") {
        nextIndex = prevList.length - 1;
      } else if (next === "top") {
        nextIndex = 0;
      } else if (currentIndex !== -1) {
        nextIndex = next === "next" ? currentIndex + 1 : currentIndex - 1;
        if (nextIndex >= prevList.length) {
          nextIndex = 0;
        } else if (nextIndex < 0) {
          nextIndex = prevList.length - 1;
        }
      }
      else
        return prevList;
      const newCurrentTurn = prevList[nextIndex].name;
      setCurrentTurn(newCurrentTurn);
      console.log(newCurrentTurn);
      return prevList;
    });
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      let base64Image: string;
      reader.onloadend = async () => {
        base64Image = reader.result as string; // Get the base64 string of the image
        setPawns((prevPawns) => {
          const updatedPawns = [...prevPawns];
          if (index !== -1) {
            updatedPawns[index] = {
              ...updatedPawns[index],
              picture: base64Image, // Update the picture field with the base64 string
            };
          }
          return updatedPawns;
        });
        console.log(JSON.stringify({ "picture": base64Image as string }));
        try {
          const response = await fetch(`${API_URL}/${game.id}/pawns/modify-pawn/${pawns[index].id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ "picture": base64Image }),
          });
          if (!response.ok) {
            throw new Error("Failed to update pawn picture");
          }
        } catch(error){
          console.error("Error updating pawn:", error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePawnDimensions = async (_event: React.MouseEvent<HTMLElement>, newDim: number, index: number) => {
    console.log(JSON.stringify({ dimension_x: newDim }));
    setPawns((prevPawns) => {
      const updatedPawns = [...prevPawns];
      updatedPawns[index] = {
        ...updatedPawns[index],
        ['dimension_x']: newDim,
      };
      return updatedPawns;
    });
    try {
      const response = await fetch(`${API_URL}/${game.id}/pawns/modify-pawn/${pawns[index].id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dimension_x: newDim }),
      });
      if (!response.ok) {
        throw new Error("Failed to update pawn");
      }
    } catch (error) {
      console.error("Error updating pawn:", error);
    }
  };

  const addToInitiative = (pawn: InitiativeListItem) => {
    if (initiativeList.some((item) => item.name === pawn.name)) {
      console.log("Pawn is already in the initiative list.");
      return;
    }
    setInitiativeList((prevList) => {
      const updatedList = [...prevList, pawn].sort(
        (a, b) => b.initiative - a.initiative
      );
      return updatedList;
    });
  }

  const handleAddToInitiative = async ( _event: React.MouseEvent<HTMLButtonElement, MouseEvent>, pawnName: string, initiativeMod: number, isPawnAi: boolean) => {
    const pawn : InitiativeListItem = {name: pawnName, initiative: ((Math.floor(Math.random() * 20) + 1) + initiativeMod), ai_enabled: isPawnAi};
    addToInitiative(pawn);
    console.log('do bazy');
    console.log(JSON.stringify({ pawn }));
    try {
      const response = await fetch(
        `${API_URL}/games/${game.id}/add-to-initiative`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ "name":pawn.name, "initiative": pawn.initiative, "ai_enabled": pawn.ai_enabled  }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to add pawn to initiative list on server");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteFromInitiative = async ( _event: React.MouseEvent<HTMLButtonElement, MouseEvent>, pawn: InitiativeListItem, index: number) => {
    setInitiativeList((prevList) => 
      prevList.filter((_, i) => i !== index)
    );
    try {
      const response = await fetch(`${API_URL}/games/${game.id}/delete-from-initiative/${pawn.name}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to update pawn picture");
      }
    } catch(error) { 
      console.log(error);
    }
  };
  
  return (
      <Paper sx={{  
        height: '98vh', 
        overflow: 'hidden', 
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: "space-between",        
        width: 300,
        borderRadius: "20px",
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(5px)',
        position: 'absolute',
        right: 0,
        outline: " 2px solid indigo" 
        }}>
        {selectedPawnIndex !== null && (
          <Paper sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            gap: 0.2,
            padding: 1,
            borderRadius: "20px",
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(5px)',
            outline: " 1px solid indigo"
          }}>
            <Typography> {pawns[selectedPawnIndex].pawn_name}'s character sheet </Typography>
            <Grid container rowSpacing={1} columns={6} columnSpacing={{ xs: 1, sm: 2, md: 1 }}>
              <Grid size={2}>
                <TextField
                label="STR"
                type='number'
                size='small'
                value={pawns[selectedPawnIndex]?.strength || ''}
                onChange={(e) => handleStatChange('strength', Math.max(1, +e.target.value), selectedPawnIndex)}
                />
              </Grid>
              <Grid size={2}>
                <TextField
                  label="INT"
                  type='number'
                  size='small'
                  value={pawns[selectedPawnIndex]?.intelligence || ''}
                  onChange={(e) => handleStatChange('intelligence', Math.max(1, +e.target.value), selectedPawnIndex)}
                  />
              </Grid>
              <Grid size={2}>
                <TextField
                label="HP"
                type='number'
                size='small'
                value={pawns[selectedPawnIndex]?.hit_points || ''}
                onChange={(e) => handleStatChange('hit_points', Math.max(0, +e.target.value), selectedPawnIndex)}
                />
              </Grid>
              <Grid size={2}>
                <TextField
                  label="DEX"
                  type='number'
                  size='small'
                  value={pawns[selectedPawnIndex]?.dexterity || ''}
                  onChange={(e) => handleStatChange('dexterity', Math.max(1, +e.target.value), selectedPawnIndex)}
                  />
              </Grid>
              <Grid size={2}>
                <TextField
                label="WIS"
                type='number'
                size='small'
                value={pawns[selectedPawnIndex]?.wisdom || ''}
                onChange={(e) => handleStatChange('wisdom', Math.max(1, +e.target.value), selectedPawnIndex)}
                />
              </Grid>
              <Grid size={2}>
                <TextField
                  label="SPD"
                  type='number'
                  size='small'
                  value={pawns[selectedPawnIndex]?.speed || ''}
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">ft</InputAdornment>,
                    },
                  }}
                  onChange={(e) => handleStatChange('speed', Math.max(0, +e.target.value), selectedPawnIndex)}
                  />
              </Grid>
              <Grid size={2}>
                <TextField
                label="CON"
                type='number'
                size='small'
                value={pawns[selectedPawnIndex]?.constitution || ''}
                onChange={(e) => handleStatChange('constitution', Math.max(1, +e.target.value), selectedPawnIndex)}
                />
              </Grid>
              <Grid size={2}>
                <TextField
                  label="CHA"
                  type='number'
                  size='small'
                  value={pawns[selectedPawnIndex]?.charisma || ''}
                  onChange={(e) => handleStatChange('charisma', Math.max(1, +e.target.value), selectedPawnIndex)}
                  />
              </Grid>
              <Grid size={2}>
                <TextField
                label="INI MOD"
                type='number'
                size='small'
                value={pawns[selectedPawnIndex]?.initiative || ''}
                onChange={(e) => handleStatChange('initiative', +e.target.value, selectedPawnIndex)}
                />
              </Grid>
            </Grid>
            <Typography>size</Typography>
            <ToggleButtonGroup 
              color='primary' 
              value={pawns[selectedPawnIndex].dimension_x}
              exclusive
              aria-label='Size'
              onChange={(event, newDim) => handlePawnDimensions(event, newDim, selectedPawnIndex)}
              >
              <ToggleButton value={50}>1x1</ToggleButton>
              <ToggleButton value={100}>2x2</ToggleButton>
              <ToggleButton value={150}>3x3</ToggleButton>
              <ToggleButton value={200}>4x4</ToggleButton>
            </ToggleButtonGroup>
            <Button onClick={(e) => handleAddToInitiative(e,pawns[selectedPawnIndex].pawn_name, pawns[selectedPawnIndex].initiative, pawns[selectedPawnIndex].ai_enabled)}>Roll Initiative</Button>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              id="upload-photo"
              onChange={(e) => handleFileChange(e, selectedPawnIndex)}
            />
            <label htmlFor="upload-photo">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
              >
                Upload Photo
              </Button>
            </label>
          </Paper>
        )}
        {hoveredPawnIndex !== null && (
          <Paper sx={{ 
            width: 300, 
            height: '20vh', 
            overflowY: 'auto', 
            zIndex: 10,
            borderRadius: "20px",
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(5px)',
            outline: " 1px solid indigo",
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center' }}>
              <Typography variant="h6">{pawns[hoveredPawnIndex].pawn_name}'s Statistics</Typography>
              <Typography variant="body1">Hit Points: {pawns[hoveredPawnIndex].hit_points}</Typography>
              <Typography variant="body1">Armour Class: {pawns[hoveredPawnIndex].armor_class}</Typography>
              <Typography variant="body1">Attack Bonus: {pawns[hoveredPawnIndex].attack_bonus}</Typography>
              <Typography variant="body1">Damage Bonus: {pawns[hoveredPawnIndex].damage_bonus}</Typography>
          </Paper>
        )}
        {isInitiative && (
        <Paper sx={{ 
            width: 300, 
            height: '30vh',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: "20px",
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(5px)',
            outline: " 1px solid indigo" }}>
            <Box sx={{display: 'flex', justifyContent: 'center'}}>
            <Button onClick={(e) => handleCurrentInitiative(e, "bottom")}>Bottom</Button>
              <Button onClick={(e) => handleCurrentInitiative(e, "prev")}>Prev</Button>
              <Button onClick={(e) => handleCurrentInitiative(e, "next")}>Next</Button>
              <Button onClick={(e) => handleCurrentInitiative(e, "top")}>Top</Button>
            </Box>
          <List dense={true} component='nav' sx={{overflowY: 'auto', flexGrow: 1}}>
            {initiativeList.map((pawn, index) => (
              <ListItemButton key={index} selected={currentTurn === pawn.name}>
                <ListItemText primary={pawn.name} secondary={pawn.initiative.toString()} />
                {pawn.ai_enabled && (
                <IconButton edge="start" aria-label="make turn" onClick={(e) => handlePawnController(e, pawn.name)} >
                  <AutoModeIcon />
                </IconButton>
                )}
                <IconButton edge="end" aria-label="delete" onClick={(e) => handleDeleteFromInitiative(e, pawn, index)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemButton>
            ))}
          </List>
        </Paper>
        )}
      </Paper>
  );
};

export default RightPanel;