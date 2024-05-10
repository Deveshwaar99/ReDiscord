import { getProfile } from '@/lib/getProfile'
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from 'lucide-react'
import { redirect } from 'next/navigation'
import { ChannelTypes, MemberRoles, ServerDetails } from '../../../types'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import ServerChannel from './ServerChannel'
import ServerMember from './ServerMember'
import ServerSearch from './ServerSearch'
import ServerSection from './ServerSection'
import ServerSidebarHeader from './ServerSidebarHeader'

interface ServerSidebarProps {
  server: ServerDetails
  role: MemberRoles
}

const iconMap: { [key in ChannelTypes]: React.JSX.Element } = {
  TEXT: <Hash className="mr-2 h-4 w-4" />,
  AUDIO: <Mic className="mr-2 h-4 w-4" />,
  VIDEO: <Video className="mr-2 h-4 w-4" />,
} as const

const roleIconMap: { [key in MemberRoles]: React.JSX.Element | null } = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="mr-2 h-4 w-4 text-indigo-500" />,
  ADMIN: <ShieldAlert className="mr-2 h-4 w-4 text-rose-500" />,
} as const

async function ServerSidebar({ server, role }: ServerSidebarProps) {
  const profile = await getProfile()

  if (!profile) {
    return redirect('/')
  }

  const textChannels = server.channels.filter(channel => channel.type === 'TEXT')
  const audioChannels = server.channels.filter(channel => channel.type === 'AUDIO')
  const videoChannels = server.channels.filter(channel => channel.type === 'VIDEO')
  const members = server.members.filter(member => member.profileId !== profile.id)

  const role = server.members.find(member => member.profileId === profile.id)?.role
  return (
    <div className="flex h-full w-full flex-col bg-[#F2F3F5] text-primary dark:bg-[#2B2D31]">
      <ServerSidebarHeader server={server} role={role} />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          {/* add a search option  */}
          <ServerSearch
            data={[
              {
                label: 'Text Channels',
                type: 'channel',
                data: textChannels.map(channel => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: 'Audio channels',
                type: 'channel',
                data: audioChannels.map(channel => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: 'Video Channels',
                type: 'channel',
                data: videoChannels.map(channel => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: 'Members',
                type: 'member',
                data: members.map(member => ({
                  id: member.id,
                  name: member.profile.name ?? '',
                  icon: roleIconMap[member.role],
                })),
              },
            ]}
          />
        </div>

        <Separator className="my-2 rounded-md bg-zinc-200 dark:bg-zinc-700" />

        {!!textChannels.length && (
          //Display a Channel Header with a create Channel button
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType="TEXT"
              role={role}
              label="Text Channels"
              server={server}
            />
            {/* List the available TEXT channels */}
            <div className="space-y-2">
              {textChannels.map(channel => (
                <ServerChannel key={channel.id} channel={channel} server={server} role={role} />
              ))}
            </div>
          </div>
        )}

        {!!audioChannels.length && (
          //Display a Channel Header with a create Channel button
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType="AUDIO"
              role={role}
              label="Voice Channels"
              server={server}
            />
            {/* List the available AUDIO channels */}
            <div className="space-y-2">
              {audioChannels.map(channel => (
                <ServerChannel key={channel.id} channel={channel} server={server} role={role} />
              ))}
            </div>
          </div>
        )}

        {!!videoChannels.length && (
          //Display a Channel Header with a create Channel button
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType="VIDEO"
              role={role}
              label="Video Channels"
              server={server}
            />
            {/* List the available VIDEO channels */}
            <div className="space-y-2">
              {videoChannels.map(channel => (
                <ServerChannel key={channel.id} channel={channel} server={server} role={role} />
              ))}
            </div>
          </div>
        )}

        {!!members.length && (
          <div className="mb-2">
            {/*  MEMBER Header with Manage Members button */}
            <ServerSection sectionType="members" role={role} label="Members" server={server} />
            {/* List the MEMERS */}
            <div className="space-y-2">
              {members.map(member => (
                <ServerMember key={member.id} member={member} server={server} role={role} />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

export default ServerSidebar
