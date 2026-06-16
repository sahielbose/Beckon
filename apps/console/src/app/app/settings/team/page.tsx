import { InviteForm } from "@/components/invite-form"
import { revokeInvitationAction } from "@/server/actions/team"
import { requireOrgId } from "@/server/current"
import { getOrg, listMembers, listPendingInvitations } from "@/server/queries"
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@beckon/ui"

export default async function TeamSettingsPage() {
  const orgId = await requireOrgId()
  const [members, org, invites] = await Promise.all([
    listMembers(orgId),
    getOrg(orgId),
    listPendingInvitations(orgId),
  ])

  return (
    <section className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Team</h1>
        <p className="text-sm text-ink-muted">People in {org?.name ?? "your workspace"}.</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>{member.name ?? "Not set"}</TableCell>
              <TableCell className="text-ink-muted">{member.email}</TableCell>
              <TableCell>
                <Badge variant={member.role === "owner" ? "default" : "muted"}>{member.role}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="space-y-4 border-t border-line pt-8">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Invite a teammate</h2>
          <p className="text-sm text-ink-muted">
            Send an email invite. They join your workspace when they accept.
          </p>
        </div>
        <InviteForm />
      </div>

      {invites.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
            Pending invites
          </h3>
          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line">
            {invites.map((invite) => (
              <li
                key={invite.id}
                className="flex items-center justify-between gap-4 px-4 py-3 transition-colors duration-micro ease-standard hover:bg-bg-subtle"
              >
                <div className="space-y-0.5">
                  <span className="text-sm text-ink">{invite.email}</span>
                  <p className="text-xs text-ink-faint">Invited as {invite.role}</p>
                </div>
                <form action={revokeInvitationAction}>
                  <input type="hidden" name="invitationId" value={invite.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    Revoke
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
