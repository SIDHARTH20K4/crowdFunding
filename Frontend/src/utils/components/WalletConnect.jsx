import { ConnectButton } from '@rainbow-me/rainbowkit';

export const Connect = () => {
  return (<ConnectButton 
              chainStatus="icon"
              showBalance={false}
              label="Connect Wallet"
              accountStatus="address"
              className="connect-button-overrides"
            />);
};