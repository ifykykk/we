
import { SignedIn, UserProfile } from '@clerk/clerk-react'
import Wrapper from '../components/Wrapper'
// ...existing code...

const ProfilePage = () => {
  return (
    <Wrapper>
        <div className="mb-6">
// ...existing code...
        </div>
        <SignedIn>
            <UserProfile/>
        </SignedIn>
    </Wrapper>
  )
}

export default ProfilePage