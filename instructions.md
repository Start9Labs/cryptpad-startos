# Using CryptPad

**Note**: It is recommended that you open a new browser tab to your Embassy while following these instructions. Otherwise, you will have to close and re-open them multiple times.

## Initial Setup

1. In Config, choose whether you want to use CryptPad over LAN (.local) or Tor (.onion). This can be changed at any time.

**Note**: *embassyOS is unaware of the above setting. For example, if you are currently connected to your Embassy over Tor and you click "Launch UI", CryptPad will open CryptPad over Tor, even if you have CryptPad configured to use LAN. You will have to manually edit the URL bar in this case.*

2. Launch your CryptPad UI, click "Sign Up", and create an account. Choose a good password. We recommend saving this password in a password manager, such as Vaultwarden on you Embassy.

3. After creating your account, click your name abbreviation in the upper right corner. Click Profile --> View My Profile. Copy the public key from your profile page, then go back into CryptPad config on your Embassy and paste this public key into "Admin User Public Key". This grants your user the ability to access the Admin Panel, where you can manage more configurations - including preventing any new users from signing up.

4. Optionally enter an email address into your CryptPad config settings. If you choose to share your CryptPad servers with others, this is the email they will see to contact you for assistance.

## General Usage

Check out the [CryptPad docs](https://docs.cryptpad.org) for detailed instructions on how to use CryptPad

## Accessing the Admin Panel

In embassyOS, go into your CryptPad "Properties" page. Copy/paste the "Admin" URL for LAN or Tor, and paste it into a new tab.