// NodePort assignments for the Kubernetes deployment.
export const K8S_PORTS = [
  { service: 'frontend',         nodePort: '30080', description: 'React SPA' },
  { service: 'backend',          nodePort: '30800', description: 'FastAPI core' },
  { service: 'spin-docs',        nodePort: '30001', description: 'Architecture diagrams + dev docs (system role)' },
  { service: 'cloud-insight-ai', nodePort: '30002', description: 'Data Ingestion MF remote frontend' },
  { service: 'anomascan',        nodePort: '30003', description: 'Vision Watch MF remote frontend' },
]
