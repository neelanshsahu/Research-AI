/**
 * useResearch — Custom hook that manages:
 * - POST to /api/research/start
 * - SSE stream connection to /api/research/stream/:taskId
 * - Agent state updates
 * - Final report state
 */
import { useState, useRef, useCallback } from 'react'

const INITIAL_AGENTS = {
  coordinator: { status: 'idle', message: '', output: null },
  research:    { status: 'idle', message: '', output: null },
  fact_check:  { status: 'idle', message: '', output: null },
  summary:     { status: 'idle', message: '', output: null },
  report:      { status: 'idle', message: '', output: null },
}

export function useResearch() {
  const [phase, setPhase]         = useState('idle')  // idle | loading | streaming | complete | error
  const [topic, setTopic]         = useState('')
  const [agents, setAgents]       = useState(INITIAL_AGENTS)
  const [report, setReport]       = useState(null)
  const [errorMsg, setErrorMsg]   = useState('')
  const eventSourceRef            = useRef(null)
  const completedRef              = useRef(false)

  const resetState = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    completedRef.current = false
    setAgents(INITIAL_AGENTS)
    setReport(null)
    setErrorMsg('')
  }, [])

  const updateAgent = useCallback((agentKey, updates) => {
    setAgents(prev => ({
      ...prev,
      [agentKey]: { ...prev[agentKey], ...updates },
    }))
  }, [])

  const startResearch = useCallback(async (searchTopic) => {
    resetState()
    setTopic(searchTopic)
    setPhase('loading')

    try {
      // 1. Create task via REST
      const res = await fetch('/api/research/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: searchTopic }),
      })

      if (!res.ok) {
        let errDetail = 'Failed to start research task'
        try {
          const err = await res.json()
          errDetail = Array.isArray(err?.detail) ? err.detail[0].msg : (err?.detail || errDetail)
        } catch (e) {
          errDetail = `Server error: ${res.status} ${res.statusText}`
        }
        throw new Error(errDetail)
      }

      let data
      try {
        data = await res.json()
      } catch (e) {
        throw new Error('Server returned invalid JSON. Is the backend running?')
      }
      const { task_id } = data
      setPhase('streaming')
      completedRef.current = false

      // 2. Open SSE stream
      const es = new EventSource(`/api/research/stream/${task_id}`)
      eventSourceRef.current = es

      es.addEventListener('start', () => {
        // stream handshake confirmed
      })

      es.addEventListener('agent_update', (e) => {
        try {
          const data = JSON.parse(e.data)
          updateAgent(data.agent, {
            status: data.status,
            message: data.message || '',
            output: data.output || null,
          })
        } catch (_) {}
      })

      es.addEventListener('complete', (e) => {
        try {
          const data = JSON.parse(e.data)
          setReport(data)
          setPhase('complete')
          completedRef.current = true
          es.close()
          eventSourceRef.current = null
        } catch (_) {}
      })

      es.addEventListener('error', (e) => {
        try {
          const data = JSON.parse(e.data)
          setErrorMsg(data.message || 'An error occurred during research.')
          setPhase('error')
          es.close()
          eventSourceRef.current = null
        } catch (_) {}
      })

      // Native onerror — fires when connection drops
      es.onerror = () => {
        if (!completedRef.current) {
          setTimeout(() => {
            if (!completedRef.current && eventSourceRef.current) {
              setErrorMsg('Connection to server lost. Make sure the backend is running on port 8000.')
              setPhase('error')
              es.close()
              eventSourceRef.current = null
            }
          }, 800)
        }
      }

    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Is the backend running?')
      setPhase('error')
    }
  }, [resetState, updateAgent])

  const reset = useCallback(() => {
    resetState()
    setPhase('idle')
    setTopic('')
  }, [resetState])

  return {
    phase,
    topic,
    agents,
    report,
    errorMsg,
    startResearch,
    reset,
  }
}
