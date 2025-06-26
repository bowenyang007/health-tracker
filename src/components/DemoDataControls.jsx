// ============================================================================
// DEMO DATA CONTROLS COMPONENT - APTOS ENABLED
// ============================================================================
// This component provides UI controls for loading/clearing demo data on Aptos blockchain.
// ============================================================================

import { Database, Trash2, AlertTriangle, Wallet } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { dataService } from '../services/dataService'
import AptosHealthService from '../services/aptosService'

const DemoDataControls = ({ onDataChange, showAsCard = false, showAdvanced = false }) => {
  const [demoExists, setDemoExists] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastTransaction, setLastTransaction] = useState(null)
  const { account, connected, signAndSubmitTransaction } = useWallet()

  useEffect(() => {
    const checkDemoData = async () => {
      if (connected && account) {
        // Check blockchain for demo data
        try {
          const result = await AptosHealthService.loadHealthData(account)
          setDemoExists(result.data && result.data.length > 0)
        } catch (error) {
          // Fallback to local storage check
          setDemoExists(await dataService.hasDemoData())
        }
      } else {
        // Check local storage when wallet not connected
        setDemoExists(await dataService.hasDemoData())
      }
    }
    checkDemoData()
  }, [connected, account])

  const handleLoadDemo = async () => {
    setIsLoading(true)
    try {
      if (connected && account) {
        // Load demo data to blockchain
        const result = await AptosHealthService.loadDemoData(signAndSubmitTransaction, account)
        if (result.success) {
          setLastTransaction(result.hash)
          alert(`✅ ${result.message}\nTransaction: ${result.hash}`)
          setDemoExists(true)
        } else {
          alert(`❌ Error: ${result.error}`)
        }
      } else {
        // Fallback to local storage
        const result = await dataService.loadDemoData()
        setDemoExists(await dataService.hasDemoData())
        if (!result.success) {
          alert(`ℹ️ ${result.message}`)
        }
      }
      if (onDataChange) onDataChange()
    } catch (error) {
      alert(`❌ Error loading demo data: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearDemo = async () => {
    setIsLoading(true)
    try {
      if (connected && account) {
        // Clear demo data from blockchain
        const result = await AptosHealthService.clearHealthData(signAndSubmitTransaction, account)
        if (result.success) {
          setLastTransaction(result.hash)
          alert(`✅ ${result.message}\nTransaction: ${result.hash}`)
          setDemoExists(false)
        } else {
          alert(`❌ Error: ${result.error}`)
        }
      } else {
        // Fallback to local storage
        await dataService.clearDemoData()
        setDemoExists(await dataService.hasDemoData())
      }
      if (onDataChange) onDataChange()
    } catch (error) {
      alert(`❌ Error clearing data: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearAll = async () => {
    if (window.confirm('⚠️ This will delete ALL your data (demo + manual entries). Are you sure?')) {
      setIsLoading(true)
      try {
        if (connected && account) {
          // Clear all data from blockchain
          const result = await AptosHealthService.clearHealthData(signAndSubmitTransaction, account)
          if (result.success) {
            setLastTransaction(result.hash)
            alert(`✅ All data cleared from blockchain!\nTransaction: ${result.hash}`)
            setDemoExists(false)
          } else {
            alert(`❌ Error: ${result.error}`)
          }
        } else {
          // Fallback to local storage
          await dataService.clearAllData()
          setDemoExists(false)
        }
        if (onDataChange) onDataChange()
      } catch (error) {
        alert(`❌ Error clearing all data: ${error.message}`)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const controls = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {!connected && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Wallet size={16} />
          <span>Connect wallet above to store data on Aptos blockchain</span>
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={handleLoadDemo}
        disabled={isLoading}
        style={{ opacity: isLoading ? 0.6 : 1 }}
      >
        <Database size={16} />
        {isLoading ? 'Loading...' : (demoExists ? 'Demo Data Already Loaded' : 'Load Demo Data (90 days daily)')}
      </button>

      {demoExists && (
        <button
          className="btn btn-secondary"
          onClick={handleClearDemo}
          disabled={isLoading}
          style={{ fontSize: '0.875rem', opacity: isLoading ? 0.6 : 1 }}
        >
          <Trash2 size={16} />
          {isLoading ? 'Clearing...' : 'Clear Demo Data Only'}
        </button>
      )}

      {showAdvanced && (
        <button
          className="btn btn-secondary"
          onClick={handleClearAll}
          disabled={isLoading}
          style={{
            fontSize: '0.875rem',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            borderColor: '#fecaca',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          <AlertTriangle size={16} />
          {isLoading ? 'Clearing...' : 'Clear ALL Data (Demo + Manual)'}
        </button>
      )}

      <div style={{
        fontSize: '0.75rem',
        color: '#64748b',
        textAlign: 'center',
        lineHeight: '1.4'
      }}>
        {connected ? (
          <div>
                         <p style={{ margin: 0, fontSize: '0.7rem', color: '#10b981' }}>
               🔗 Connected to Aptos {account ? `(${account.address.toString().slice(0, 6)}...${account.address.toString().slice(-4)})` : ''}
             </p>
            {lastTransaction && (
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.65rem' }}>
                Last TX: {lastTransaction.slice(0, 8)}...{lastTransaction.slice(-8)}
              </p>
            )}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: '0.7rem', fontStyle: 'italic' }}>
            Using local storage (connect wallet for blockchain storage)
          </p>
        )}
        
        {demoExists ? (
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.7rem' }}>
            ✅ Demo data loaded (~70 daily entries). Your manual entries are preserved.
          </p>
        ) : (
          <>
            <p style={{ margin: '0.5rem 0 0.5rem 0', fontSize: '0.7rem', fontStyle: 'italic' }}>
              Demo: 90-day daily weight tracking (195→170 lbs)
            </p>
            <p style={{ margin: 0, fontSize: '0.7rem' }}>
              Safe: Won't overwrite your existing data
            </p>
          </>
        )}
      </div>
    </div>
  )

  if (showAsCard) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <h3>No data yet</h3>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          Load demo data to see how the tracker works, or go to Weight Tracker to add your first entry.
          {connected ? ' Your data will be stored on the Aptos blockchain!' : ' Connect your wallet to store data on-chain.'}
        </p>
        {controls}
      </div>
    )
  }

  return controls
}

export default DemoDataControls

// ============================================================================
// END OF DEMO DATA CONTROLS - APTOS ENABLED
// ============================================================================
