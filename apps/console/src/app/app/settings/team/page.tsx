import { requireOrgId } from "@/server/current"
import { getOrg, listMembers } from "@/server/queries"
import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@beckon/ui"

export default async function TeamSettingsPage() {
  const orgId = await requireOrgId()
  const [members, org] = await Promise.all([listMembers(orgId), getOrg(orgId)])

  return (
    <section className="space-y-6">
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

      {/* STUB: inviting teammates by email needs a transactional email provider,
          wired during activation (Section 17). The members table above is live. */}
      <p className="text-sm text-ink-faint">
        Inviting teammates by email is not available yet. It is enabled once an email provider is
        connected.
      </p>
    </section>
  )
}
