import { test, expect } from '@playwright/test';

test.describe('MetaMask Integration Tests', () => {
  // Test HTML content
  const HTML_CONTENT = `
    <html>
      <head>
        <title>XBorg - Wallet Integration Test</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; }
          .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          button { padding: 10px 16px; background: #4c6ef5; color: white; border: none; border-radius: 4px; cursor: pointer; }
          button:hover { background: #364fc7; }
          button:disabled { background: #a5a5a5; cursor: not-allowed; }
          .status { margin: 15px 0; padding: 10px; border-radius: 4px; }
          .success { background-color: #d4edda; color: #155724; }
          .error { background-color: #f8d7da; color: #721c24; }
          .info { background-color: #d1ecf1; color: #0c5460; }
          #account-display { font-family: monospace; }
          pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Wallet Integration Test</h1>
          
          <div class="card">
            <h2>Connect Wallet</h2>
            <button id="connect-wallet">Connect with MetaMask</button>
            <div id="connection-status"></div>
            
            <div id="account-info" style="display: none;">
              <h3>Connected Account</h3>
              <p>Address: <span id="account-display"></span></p>
              <p>Network: <span id="network-display"></span></p>
            </div>
          </div>
          
          <div class="card">
            <h2>Sign Message</h2>
            <button id="sign-message" disabled>Sign Message</button>
            <div id="signature-status"></div>
            <pre id="signature-data"></pre>
          </div>
          
          <div class="card">
            <h2>Send Transaction</h2>
            <button id="send-transaction" disabled>Send Transaction</button>
            <div id="transaction-status"></div>
            <pre id="transaction-data"></pre>
          </div>
        </div>
        
        <script>
          // Mock ethereum provider for testing
          const mockEthereum = {
            isMetaMask: true,
            networkVersion: '1', // Mainnet
            selectedAddress: null,
            isConnected: false,
            
            // Request method - handles different JSON-RPC methods
            request: async function({ method, params }) {
              console.log('MetaMask request:', method, params);
              
              switch(method) {
                case 'eth_requestAccounts':
                  if (!this.isMetaMask) {
                    throw new Error('MetaMask not installed');
                  }
                  
                  if (typeof mockEthereum._shouldFailConnection !== 'undefined' && mockEthereum._shouldFailConnection) {
                    throw new Error('User rejected connection');
                  }
                  
                  this.selectedAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
                  this.isConnected = true;
                  
                  // Emit event
                  const connectEvent = new Event('connect');
                  window.dispatchEvent(connectEvent);
                  
                  const accountsChangedEvent = new CustomEvent('accountsChanged', { 
                    detail: [this.selectedAddress]
                  });
                  window.dispatchEvent(accountsChangedEvent);
                  
                  return [this.selectedAddress];
                  
                case 'eth_chainId':
                  return '0x1'; // Mainnet
                  
                case 'net_version':
                  return this.networkVersion;
                  
                case 'eth_accounts':
                  return this.isConnected ? [this.selectedAddress] : [];
                  
                case 'personal_sign':
                  if (!this.isConnected) {
                    throw new Error('Not connected');
                  }
                  
                  if (typeof mockEthereum._shouldFailSigning !== 'undefined' && mockEthereum._shouldFailSigning) {
                    throw new Error('User rejected signing');
                  }
                  
                  // Generate a mock signature
                  return '0x29f7212ecc1c76cea81174af267b67506f754ea8c73f144afa900a0d85b24b21550aa6c5b332d155719a94353f8ac4fa79409356699003c0b74f3bb9c7348b901b';
                  
                case 'eth_sendTransaction':
                  if (!this.isConnected) {
                    throw new Error('Not connected');
                  }
                  
                  if (typeof mockEthereum._shouldFailTransaction !== 'undefined' && mockEthereum._shouldFailTransaction) {
                    throw new Error('User rejected transaction');
                  }
                  
                  // Return a mock transaction hash
                  return '0x5a99cc8076253c775629aa02d519d4953f18cf6cb3e6f1f85a5c412b2cea7f66';
                  
                default:
                  throw new Error('Method not implemented: ' + method);
              }
            }
          };
          
          // Add the mock provider to window
          window.ethereum = mockEthereum;
          
          // UI Elements
          const connectButton = document.getElementById('connect-wallet');
          const signButton = document.getElementById('sign-message');
          const sendTxButton = document.getElementById('send-transaction');
          const connectionStatus = document.getElementById('connection-status');
          const accountInfo = document.getElementById('account-info');
          const accountDisplay = document.getElementById('account-display');
          const networkDisplay = document.getElementById('network-display');
          const signatureStatus = document.getElementById('signature-status');
          const signatureData = document.getElementById('signature-data');
          const transactionStatus = document.getElementById('transaction-status');
          const transactionData = document.getElementById('transaction-data');
          
          // Display status helpers
          function showStatus(element, message, type) {
            element.textContent = message;
            element.className = 'status ' + type;
          }
          
          // Connect wallet
          connectButton.addEventListener('click', async () => {
            try {
              connectionStatus.textContent = 'Connecting...';
              connectionStatus.className = 'status info';
              
              // Check if MetaMask is installed
              if (!window.ethereum || !window.ethereum.isMetaMask) {
                showStatus(connectionStatus, 'MetaMask not installed!', 'error');
                return;
              }
              
              // Request accounts
              const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
              
              if (accounts.length === 0) {
                showStatus(connectionStatus, 'No accounts found!', 'error');
                return;
              }
              
              // Get network
              const chainId = await window.ethereum.request({ method: 'eth_chainId' });
              const networkName = getNetworkName(chainId);
              
              // Update UI
              accountDisplay.textContent = accounts[0];
              networkDisplay.textContent = networkName;
              accountInfo.style.display = 'block';
              
              // Enable other buttons
              signButton.disabled = false;
              sendTxButton.disabled = false;
              
              showStatus(connectionStatus, 'Connected!', 'success');
            } catch (error) {
              console.error(error);
              showStatus(connectionStatus, 'Connection failed: ' + error.message, 'error');
            }
          });
          
          // Sign message
          signButton.addEventListener('click', async () => {
            try {
              signatureStatus.textContent = 'Signing...';
              signatureStatus.className = 'status info';
              signatureData.textContent = '';
              
              // Check if connected
              if (!window.ethereum.selectedAddress) {
                showStatus(signatureStatus, 'Not connected!', 'error');
                return;
              }
              
              // Message to sign
              const message = 'XBorg Authentication ' + new Date().toISOString();
              
              // Sign message
              const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, window.ethereum.selectedAddress]
              });
              
              // Display signature
              showStatus(signatureStatus, 'Signed successfully!', 'success');
              signatureData.textContent = JSON.stringify({
                message: message,
                signature: signature,
                address: window.ethereum.selectedAddress
              }, null, 2);
            } catch (error) {
              console.error(error);
              showStatus(signatureStatus, 'Signing failed: ' + error.message, 'error');
            }
          });
          
          // Send transaction
          sendTxButton.addEventListener('click', async () => {
            try {
              transactionStatus.textContent = 'Sending transaction...';
              transactionStatus.className = 'status info';
              transactionData.textContent = '';
              
              // Check if connected
              if (!window.ethereum.selectedAddress) {
                showStatus(transactionStatus, 'Not connected!', 'error');
                return;
              }
              
              // Transaction parameters
              const txParams = {
                from: window.ethereum.selectedAddress,
                to: '0x0000000000000000000000000000000000000000',
                value: '0x0', // 0 ETH
                data: '0x', // Empty data
                gas: '0x5208', // 21000 gas
              };
              
              // Send transaction
              const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [txParams]
              });
              
              // Display transaction hash
              showStatus(transactionStatus, 'Transaction sent!', 'success');
              transactionData.textContent = JSON.stringify({
                transactionHash: txHash,
                parameters: txParams
              }, null, 2);
            } catch (error) {
              console.error(error);
              showStatus(transactionStatus, 'Transaction failed: ' + error.message, 'error');
            }
          });
          
          // Helper to get network name from chain ID
          function getNetworkName(chainId) {
            const networks = {
              '0x1': 'Ethereum Mainnet',
              '0x3': 'Ropsten Testnet',
              '0x4': 'Rinkeby Testnet',
              '0x5': 'Goerli Testnet',
              '0x2a': 'Kovan Testnet',
              '0x38': 'Binance Smart Chain',
              '0x89': 'Polygon',
              '0xa86a': 'Avalanche'
            };
            
            return networks[chainId] || 'Unknown Network (' + chainId + ')';
          }
        </script>
      </body>
    </html>
  `;

  test.beforeEach(async ({ page }) => {
    await page.setContent(HTML_CONTENT);
  });

  test('should detect MetaMask availability', async ({ page }) => {
    // Mock check if MetaMask is installed
    const isMetaMaskInstalled = await page.evaluate(() => {
      return window.ethereum && window.ethereum.isMetaMask;
    });

    expect(isMetaMaskInstalled).toBe(true);
  });

  test('should connect to wallet successfully', async ({ page }) => {
    // Click connect button
    await page.click('#connect-wallet');

    // Check if connection status shows success
    await expect(page.locator('#connection-status')).toHaveText('Connected!');
    await expect(page.locator('#connection-status')).toHaveClass(/success/);

    // Check if account info is displayed
    await expect(page.locator('#account-info')).toBeVisible();
    await expect(page.locator('#account-display')).toHaveText(
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    );
    await expect(page.locator('#network-display')).toHaveText(
      'Ethereum Mainnet'
    );

    // Check if other buttons are enabled
    await expect(page.locator('#sign-message')).toBeEnabled();
    await expect(page.locator('#send-transaction')).toBeEnabled();
  });

  test('should handle failed wallet connection', async ({ page }) => {
    // Configure mock to fail connection
    await page.evaluate(() => {
      window.ethereum._shouldFailConnection = true;
    });

    // Click connect button
    await page.click('#connect-wallet');

    // Check if connection status shows error
    await expect(page.locator('#connection-status')).toHaveText(
      'Connection failed: User rejected connection'
    );
    await expect(page.locator('#connection-status')).toHaveClass(/error/);

    // Check if account info remains hidden
    await expect(page.locator('#account-info')).not.toBeVisible();
  });

  test('should sign message successfully', async ({ page }) => {
    // First connect to wallet
    await page.click('#connect-wallet');
    await expect(page.locator('#connection-status')).toHaveText('Connected!');

    // Now sign a message
    await page.click('#sign-message');

    // Check if signature status shows success
    await expect(page.locator('#signature-status')).toHaveText(
      'Signed successfully!'
    );
    await expect(page.locator('#signature-status')).toHaveClass(/success/);

    // Check if signature data is displayed and contains expected content
    const signatureData = await page.locator('#signature-data').textContent();
    expect(signatureData).toContain('message');
    expect(signatureData).toContain('signature');
    expect(signatureData).toContain(
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    );
  });

  test('should handle rejected message signing', async ({ page }) => {
    // First connect to wallet
    await page.click('#connect-wallet');
    await expect(page.locator('#connection-status')).toHaveText('Connected!');

    // Configure mock to fail signing
    await page.evaluate(() => {
      window.ethereum._shouldFailSigning = true;
    });

    // Try to sign a message
    await page.click('#sign-message');

    // Check if signature status shows error
    await expect(page.locator('#signature-status')).toHaveText(
      'Signing failed: User rejected signing'
    );
    await expect(page.locator('#signature-status')).toHaveClass(/error/);
  });

  test('should send transaction successfully', async ({ page }) => {
    // First connect to wallet
    await page.click('#connect-wallet');
    await expect(page.locator('#connection-status')).toHaveText('Connected!');

    // Now send a transaction
    await page.click('#send-transaction');

    // Check if transaction status shows success
    await expect(page.locator('#transaction-status')).toHaveText(
      'Transaction sent!'
    );
    await expect(page.locator('#transaction-status')).toHaveClass(/success/);

    // Check if transaction data is displayed and contains expected content
    const txData = await page.locator('#transaction-data').textContent();
    expect(txData).toContain('transactionHash');
    expect(txData).toContain(
      '0x5a99cc8076253c775629aa02d519d4953f18cf6cb3e6f1f85a5c412b2cea7f66'
    );
  });

  test('should handle rejected transaction', async ({ page }) => {
    // First connect to wallet
    await page.click('#connect-wallet');
    await expect(page.locator('#connection-status')).toHaveText('Connected!');

    // Configure mock to fail transaction
    await page.evaluate(() => {
      window.ethereum._shouldFailTransaction = true;
    });

    // Try to send a transaction
    await page.click('#send-transaction');

    // Check if transaction status shows error
    await expect(page.locator('#transaction-status')).toHaveText(
      'Transaction failed: User rejected transaction'
    );
    await expect(page.locator('#transaction-status')).toHaveClass(/error/);
  });
});
