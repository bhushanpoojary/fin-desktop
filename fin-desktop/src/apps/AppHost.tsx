interface AppHostProps {
  appId: string
}

function AppHost({ appId }: AppHostProps) {
  return (
    <div>
      <h1>App Host</h1>
      <p>Running app: {appId}</p>
    </div>
  )
}

export default AppHost
