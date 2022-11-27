# Multi Signature Wallet

A factory smart contract that can create a multisig wallet for each user. Where a transaction needs 2 signatures out of 3 private keys, one sign can be done by the user, another can be done by our verifying server (verifies using OTP), and the last one can be done by the user’s backup key.



```shell
npx hardhat test

npx hardhat node
npx hardhat run --network localhost scripts/deploy.js
```
