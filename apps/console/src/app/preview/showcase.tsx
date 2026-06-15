"use client"

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  CodeBlock,
  CommandSurface,
  CopyButton,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  FileDropzone,
  Input,
  Label,
  Reveal,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  StatusPill,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toaster,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Wordmark,
  toast,
} from "@beckon/ui"
import { Inbox, Settings } from "lucide-react"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">{title}</h2>
      {children}
    </section>
  )
}

export function Showcase() {
  return (
    <div className="space-y-14">
      <Toaster />

      <Section title="Command surface">
        <Reveal className="max-w-xl">
          <CommandSurface
            lines={[
              { role: "user", text: "Create a client named Acme" },
              { role: "agent", text: "Ready to create the client Acme. Confirm to continue." },
            ]}
          />
        </Reveal>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Publish</Button>
          <Button variant="secondary">Cancel</Button>
          <Button variant="ghost">Skip</Button>
          <Button variant="danger">Delete</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Form controls">
        <div className="grid max-w-2xl gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace name</Label>
            <Input id="name" placeholder="Acme" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select>
              <SelectTrigger id="model">
                <SelectValue placeholder="Choose a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude">Claude</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="prompt">System prompt</Label>
            <Textarea id="prompt" placeholder="You help users get things done inside the app." />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="confirm-writes" />
            <Label htmlFor="confirm-writes">Require confirmation on writes</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="agent-live" />
            <Label htmlFor="agent-live">Agent is live</Label>
          </div>
        </div>
      </Section>

      <Section title="Badges and status">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge variant="muted">Muted</Badge>
          <Badge variant="success">Live</Badge>
          <Badge variant="danger">Blocked</Badge>
          <StatusPill status="pending" />
          <StatusPill status="processing" />
          <StatusPill status="ready" />
          <StatusPill status="error" />
        </div>
      </Section>

      <Section title="Tabs and table">
        <Tabs defaultValue="tools" className="max-w-2xl">
          <TabsList>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          </TabsList>
          <TabsContent value="tools">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Confirm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>createClient</TableCell>
                  <TableCell>POST</TableCell>
                  <TableCell>
                    <StatusPill status="ready" label="Required" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>listClients</TableCell>
                  <TableCell>GET</TableCell>
                  <TableCell>
                    <Badge variant="muted">Not required</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="knowledge">
            <EmptyState
              icon={<Inbox className="h-5 w-5 text-ink-faint" />}
              title="No knowledge yet"
              description="Add a document or a URL so the agent can answer from your own content."
              action={<Button size="sm">Add your first source</Button>}
            />
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="Overlays and menus">
        <div className="flex flex-wrap items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm action</DialogTitle>
                <DialogDescription>This will create a client named Acme.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button>Create client</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">Open copilot</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Copilot</SheetTitle>
                <SheetDescription>The sidebar form factor of the widget.</SheetDescription>
              </SheetHeader>
              <div className="p-4">
                <CommandSurface />
              </div>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Agent</DropdownMenuLabel>
              <DropdownMenuItem>
                <Settings className="h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>Quiet, helpful hint</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="secondary"
            onClick={() => toast("Published", { description: "Your agent is live." })}
          >
            Show toast
          </Button>
        </div>
      </Section>

      <Section title="Cards, loading, and install">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Demo copilot</CardTitle>
              <CardDescription>A draft agent in your workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          <div className="space-y-3">
            <CodeBlock
              code={
                '<script src="https://app.beckon.dev/embed.js" data-agent-id="agt_123"></script>'
              }
            />
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              Copy the snippet <CopyButton value="agt_123" />
            </div>
          </div>
        </div>
      </Section>

      <Section title="File upload">
        <div className="max-w-md">
          <FileDropzone onFiles={(files) => toast(`Selected ${files.length} file(s)`)} multiple />
        </div>
      </Section>

      <footer className="border-t border-line pt-6">
        <Wordmark />
      </footer>
    </div>
  )
}
