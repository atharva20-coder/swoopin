import Loader from '@/components/global/loader'

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader state>...loading</Loader>
    </div>
  )
}

export default Loading