import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const ReusablePasswordDialog = ({ open, onClose, onSubmit, validAccess, title, passwordtype, batch }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
// console.log('Pass Batch', batch);
    const handleSubmit = () => {
        if (password.trim()) {
            if(passwordtype=='node' & password == 'tiger'){
                validAccess(1);
            }else if(passwordtype=='mysql' & password == 'mysql'){
                validAccess(1);
            }else if(passwordtype=='clear' & password == 'data'){
                validAccess(1);
            }else if(passwordtype=='backup' & password == 'zip'){
                validAccess(1);
            }else if(passwordtype=='activation'){
                if((batch=='11:00:00' && password=='b1') || (batch=='15:00:00' && password=='b2') ){
                    validAccess(1);
                } else {
                    validAccess(0);
                }
                
            }else if(passwordtype=='batchclosure'){
                if((batch=='11:00:00' && password=='bb1') || (batch=='15:00:00' && password=='bb2') ){
                    validAccess(2);
                } else {
                    validAccess(0);
                }
                
            }else if(passwordtype=='dayclosure'){
                if(password=='done'){
                    validAccess(3);
                } else {
                    validAccess(0);
                }
                
            }else{
                validAccess(0);
            }

            
            onSubmit(password);
            setPassword(''); // Clear password after submission
            onClose(); // Close the dialog
        } else {
            // Optionally handle empty password case
            alert('Please enter a password.');
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                {title}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    variant="standard"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={toggleShowPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton> &nbsp; &nbsp; 
                                 {<SendIcon className='sendbtn'  onClick={handleSubmit} />}
                                 
                                
                            </InputAdornment>
                        ),
                    }}
                />
             
            </DialogContent>
             
        </Dialog>
    );
};

export default ReusablePasswordDialog;
