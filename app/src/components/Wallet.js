import React, { useEffect, useState, useContext } from 'react';
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';

import {useWallet, select, close} from '../utils/wallet'

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: '#9999cc',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const Wallet = (props) => {
  const classes = useStyles();
  const {wallet, connected, setProviderUrl, WALLET_PROVIDERS, isModalVisible , select, close} = useWallet();

  const handleOpen = () => {
    if (connected) {
      wallet._handleDisconnect()
    } else {
      select()
    }
  };

  const onWalletProviderClick = (provider) => {
    if (connected) {
      wallet._handleDisconnect()
    } else {
      setProviderUrl(provider.url)
    }
  }


  return(
    <div>
      <Button
        className="nav__button"
        variant="contained"
        color="primary"
        onClick={handleOpen}
      >
        {connected ? 'Disconnect' : 'Connect'} Wallet
      </Button>

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        disableEnforceFocus
        className={classes.modal}
        open={isModalVisible}
        onClose={close}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={isModalVisible}>
          <div className={`${classes.paper} wallet__provider-wrapper`}>
          {WALLET_PROVIDERS.map(provider => {
            const name = provider.name.replace(/[\. ,:-]+/g, "-")
            return <Button
              variant="outlined"
              className={`wallet__provider-button wallet__provider-button--${name}`}
              onClick={() => setProviderUrl(provider.url)}><span className={`wallet__provider-logo wallet__provider-logo--${name}`} />{provider.name}</Button>
          })}
          </div>
        </Fade>
      </Modal>
    </div>
  )
}

export default Wallet
