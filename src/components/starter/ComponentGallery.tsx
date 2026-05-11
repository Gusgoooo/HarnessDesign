"use client";

import * as React from "react";
import { CalendarIcon, ChevronRight, Package } from "lucide-react";

import { DataTable, type ColumnDef } from "@/components/business/DataTable";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/starter/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/starter/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/starter/alert";
import { AspectRatio } from "@/components/starter/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/starter/avatar";
import { Badge } from "@/components/starter/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/starter/breadcrumb";
import { Button } from "@/components/starter/button";
import { ButtonGroup } from "@/components/starter/button-group";
import { Calendar } from "@/components/starter/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/starter/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/starter/carousel";
import { Checkbox } from "@/components/starter/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/starter/collapsible";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/starter/command";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/starter/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/starter/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/starter/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/starter/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/starter/empty";
import { Field, FieldDescription, FieldLabel } from "@/components/starter/field";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/starter/hover-card";
import { Input } from "@/components/starter/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/starter/input-group";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/starter/input-otp";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/starter/item";
import { Kbd } from "@/components/starter/kbd";
import { Label } from "@/components/starter/label";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/starter/menubar";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/starter/navigation-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/starter/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/starter/popover";
import { Progress } from "@/components/starter/progress";
import { RadioGroup, RadioGroupItem } from "@/components/starter/radio-group";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/starter/resizable";
import { ScrollArea } from "@/components/starter/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/starter/select";
import { Separator } from "@/components/starter/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/starter/sheet";
import { Skeleton } from "@/components/starter/skeleton";
import { Slider } from "@/components/starter/slider";
import { Spinner } from "@/components/starter/spinner";
import { Switch } from "@/components/starter/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/starter/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/starter/tabs";
import { Textarea } from "@/components/starter/textarea";
import { Toggle } from "@/components/starter/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/starter/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/starter/tooltip";

const toc = [
  { id: "typography", label: "排版与标签" },
  { id: "buttons", label: "按钮与切换" },
  { id: "forms", label: "表单控件" },
  { id: "input-group", label: "输入组" },
  { id: "feedback", label: "反馈与状态" },
  { id: "layout", label: "布局与结构" },
  { id: "data", label: "数据展示" },
  { id: "navigation", label: "导航" },
  { id: "overlays", label: "浮层与对话框" },
  { id: "command", label: "命令面板" },
  { id: "menus", label: "菜单" },
  { id: "advanced", label: "高级布局" },
] as const;

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-b border-border pb-10 pt-6 last:border-b-0">
      <div className="mb-6 space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">{children}</div>
    </section>
  );
}

type DemoRow = { id: string; name: string; role: string };

const demoColumns: ColumnDef<DemoRow>[] = [
  { id: "name", header: "名称", accessor: (r) => r.name },
  { id: "role", header: "角色", accessor: (r) => r.role },
];

const demoRows: DemoRow[] = [
  { id: "1", name: "Northwind", role: "客户" },
  { id: "2", name: "Contoso", role: "渠道" },
];

export function ComponentGallery() {
  const mainScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollToSection = React.useCallback((id: string) => {
    const root = mainScrollRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-background text-foreground">
      {/* 标题与说明见 Storybook「Docs」面板；高度由 ALL 故事外层容器限定，避免与画布双滚动条 */}
      <h1 className="sr-only">组件总览</h1>

      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 gap-10 px-3 pt-0 sm:px-6 sm:pt-0">
        <aside className="hidden w-44 shrink-0 overflow-y-auto border-r border-border pb-6 pt-0 lg:block">
          <nav className="space-y-0.5 border-l border-border pl-4 text-sm" aria-label="本页目录">
            {toc.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="-ml-px block w-full border-l-2 border-transparent py-1 pl-3 text-left text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main ref={mainScrollRef} className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain pb-12">
          <div className="mb-8 flex flex-wrap gap-2 border-b border-border pb-8 lg:hidden">
            {toc.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
              >
                {item.label}
              </button>
            ))}
          </div>

          <Section id="typography" title="排版与标签" description="标签、键盘提示等辅助排版。">
            <div className="flex flex-wrap items-center gap-6">
              <div className="space-y-2">
                <Label htmlFor="gallery-email">邮箱</Label>
                <Input id="gallery-email" type="email" placeholder="you@example.com" className="w-64" />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                快捷键 <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </div>
            </div>
          </Section>

          <Section id="buttons" title="按钮与切换" description="主操作、成组按钮、开关态切换。">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-2">
                <Button>默认</Button>
                <Button variant="secondary">次要</Button>
                <Button variant="outline">描边</Button>
                <Button variant="ghost">幽灵</Button>
                <Button variant="destructive">危险</Button>
                <Button size="sm">小</Button>
                <Button size="lg">大</Button>
                <Button size="icon" aria-label="图标按钮">
                  <CalendarIcon className="size-4" />
                </Button>
              </div>
              <ButtonGroup>
                <Button variant="outline" size="sm">
                  左
                </Button>
                <Button variant="outline" size="sm">
                  中
                </Button>
                <Button variant="outline" size="sm">
                  右
                </Button>
              </ButtonGroup>
              <div className="flex flex-wrap items-center gap-3">
                <Toggle aria-label="粗体">B</Toggle>
                <ToggleGroup type="single" defaultValue="a">
                  <ToggleGroupItem value="a" aria-label="选项 A">
                    A
                  </ToggleGroupItem>
                  <ToggleGroupItem value="b" aria-label="选项 B">
                    B
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>默认</Badge>
                <Badge variant="secondary">次要</Badge>
                <Badge variant="outline">描边</Badge>
                <Badge variant="destructive">危险</Badge>
              </div>
            </div>
          </Section>

          <Section id="forms" title="表单控件" description="输入、选择与开关；尺寸与 Button 对齐。">
            <div className="grid max-w-xl gap-6">
              <Field>
                <FieldLabel>带说明的字段</FieldLabel>
                <Input placeholder="输入内容" />
                <FieldDescription>简短说明文案。</FieldDescription>
              </Field>
              <div className="flex flex-wrap items-end gap-3">
                <div className="grid w-40 gap-2">
                  <Label>小号</Label>
                  <Input size="sm" placeholder="sm" />
                </div>
                <div className="grid w-40 gap-2">
                  <Label>默认</Label>
                  <Input placeholder="default" />
                </div>
                <div className="grid w-40 gap-2">
                  <Label>大号</Label>
                  <Input size="lg" placeholder="lg" />
                </div>
              </div>
              <Textarea placeholder="多行文本…" rows={3} />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one">选项一</SelectItem>
                  <SelectItem value="two">选项二</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox id="g-cb" />
                  <Label htmlFor="g-cb">复选框</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="g-sw" />
                  <Label htmlFor="g-sw">开关</Label>
                </div>
              </div>
              <RadioGroup defaultValue="r1" className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="r1" id="r1" />
                  <Label htmlFor="r1">选项 1</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="r2" id="r2" />
                  <Label htmlFor="r2">选项 2</Label>
                </div>
              </RadioGroup>
              <Slider defaultValue={[40]} max={100} step={1} className="max-w-xs" />
              <div className="flex justify-start">
                <InputOTP maxLength={6}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          </Section>

          <Section id="input-group" title="输入组" description="前缀后缀与内嵌按钮。">
            <InputGroup className="max-w-md">
              <InputGroupAddon>
                <InputGroupText>https://</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput placeholder="example.com" />
              <InputGroupAddon align="inline-end">
                <InputGroupButton variant="ghost" size="xs">
                  前往
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Section>

          <Section id="feedback" title="反馈与状态" description="提示、进度、骨架与空状态。">
            <div className="space-y-6">
              <Alert>
                <CalendarIcon className="size-4" />
                <AlertTitle>提示</AlertTitle>
                <AlertDescription>这是一条默认样式的提示信息。</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertTitle>错误</AlertTitle>
                <AlertDescription>需要用户注意的问题说明。</AlertDescription>
              </Alert>
              <div className="max-w-xs space-y-2">
                <Progress value={55} />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner />
                  加载中…
                </div>
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <Empty className="border border-dashed">
                <EmptyMedia variant="icon">
                  <Package className="size-6" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>暂无数据</EmptyTitle>
                  <EmptyDescription>可以在此放置引导操作或说明。</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          </Section>

          <Section id="layout" title="布局与结构" description="卡片、分隔、折叠与列表项。">
            <div className="space-y-8">
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle>卡片标题</CardTitle>
                  <CardDescription>副标题或补充说明。</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">卡片正文区域。</CardContent>
                <CardFooter>
                  <Button size="sm">操作</Button>
                </CardFooter>
              </Card>
              <div className="flex items-center gap-2 text-sm">
                <span>左侧</span>
                <Separator orientation="vertical" className="h-4" />
                <span>右侧</span>
              </div>
              <AspectRatio ratio={16 / 9} className="max-w-md overflow-hidden rounded-md bg-muted">
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">16:9</div>
              </AspectRatio>
              <Tabs defaultValue="tab1" className="max-w-md">
                <TabsList className="w-full">
                  <TabsTrigger value="tab1">标签一</TabsTrigger>
                  <TabsTrigger value="tab2">标签二</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1" className="mt-3 text-sm text-muted-foreground">
                  第一个面板内容。
                </TabsContent>
                <TabsContent value="tab2" className="mt-3 text-sm text-muted-foreground">
                  第二个面板内容。
                </TabsContent>
              </Tabs>
              <Accordion type="single" collapsible className="max-w-md">
                <AccordionItem value="item-1">
                  <AccordionTrigger>折叠项一</AccordionTrigger>
                  <AccordionContent>第一项下的说明文字。</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>折叠项二</AccordionTrigger>
                  <AccordionContent>第二项下的说明文字。</AccordionContent>
                </AccordionItem>
              </Accordion>
              <Collapsible className="max-w-md space-y-2">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm">
                    展开 / 收起
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="rounded-md border border-border bg-muted/40 p-3 text-sm">
                  可折叠区域内容。
                </CollapsibleContent>
              </Collapsible>
              <Item className="max-w-md">
                <ItemContent>
                  <ItemTitle>列表项标题</ItemTitle>
                  <ItemDescription>支持描述与多行展示。</ItemDescription>
                </ItemContent>
              </Item>
            </div>
          </Section>

          <Section id="data" title="数据展示" description="表格与业务 DataTable。">
            <div className="space-y-8">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>列 A</TableHead>
                    <TableHead>列 B</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>单元 1</TableCell>
                    <TableCell>单元 2</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>单元 3</TableCell>
                    <TableCell>单元 4</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="max-w-2xl space-y-2">
                <p className="text-xs font-medium text-muted-foreground">DataTable（业务）</p>
                <DataTable columns={demoColumns} data={demoRows} />
              </div>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="" alt="" />
                  <AvatarFallback>HD</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </Section>

          <Section id="navigation" title="导航" description="面包屑、分页与顶栏菜单。">
            <div className="space-y-8">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">首页</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>
                    <ChevronRight className="size-4" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage>当前页</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <Menubar>
                <MenubarMenu>
                  <MenubarTrigger>文件</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>新建</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem>退出</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger>编辑</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>撤销</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      首页
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      文档
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </Section>

          <Section id="overlays" title="浮层与对话框" description="对话框、抽屉、气泡与悬停卡。">
            <TooltipProvider>
              <div className="flex flex-wrap gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">对话框</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>标题</DialogTitle>
                      <DialogDescription>简短说明。</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button type="button" variant="outline">
                        关闭
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">确认框</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认操作？</AlertDialogTitle>
                      <AlertDialogDescription>此操作不可撤销。</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction>继续</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">抽屉板</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>侧栏标题</SheetTitle>
                      <SheetDescription>侧栏说明。</SheetDescription>
                    </SheetHeader>
                    <SheetFooter>
                      <SheetClose asChild>
                        <Button variant="outline">关闭</Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline">Drawer</Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>抽屉</DrawerTitle>
                      <DrawerDescription>移动端常用布局。</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 text-sm">内容区</div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant="outline">关闭</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">气泡</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 text-sm">气泡内容</PopoverContent>
                </Popover>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="link">悬停卡</Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-64 text-sm">悬停时显示的补充信息。</HoverCardContent>
                </HoverCard>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">提示</Button>
                  </TooltipTrigger>
                  <TooltipContent>Tooltip 文案</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </Section>

          <Section id="command" title="命令面板" description="搜索型命令列表。">
            <Command className="max-w-md rounded-lg border shadow-md">
              <CommandInput placeholder="搜索…" />
              <CommandList>
                <CommandEmpty>无结果</CommandEmpty>
                <CommandGroup heading="建议">
                  <CommandItem>日历</CommandItem>
                  <CommandItem>设置</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </Section>

          <Section id="menus" title="菜单" description="下拉与右键菜单。">
            <div className="flex flex-wrap gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">下拉菜单</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>个人资料</DropdownMenuItem>
                  <DropdownMenuItem>退出登录</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <Button variant="outline">右键区域</Button>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem>复制</ContextMenuItem>
                  <ContextMenuItem>粘贴</ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </div>
          </Section>

          <Section id="advanced" title="高级布局" description="滚动区域、可调整分割与轮播。">
            <div className="space-y-8">
              <ScrollArea className="h-32 max-w-md rounded-md border">
                <div className="space-y-2 p-4 pr-6">
                  {Array.from({ length: 12 }, (_, i) => (
                    <p key={i} className="text-sm text-muted-foreground">
                      滚动行 {i + 1}
                    </p>
                  ))}
                </div>
              </ScrollArea>
              <ResizablePanelGroup orientation="horizontal" className="max-w-xl rounded-lg border">
                <ResizablePanel defaultSize={50} minSize={20}>
                  <div className="flex h-28 items-center justify-center bg-muted/40 text-sm">左栏</div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50} minSize={20}>
                  <div className="flex h-28 items-center justify-center bg-muted/20 text-sm">右栏</div>
                </ResizablePanel>
              </ResizablePanelGroup>
              <div className="max-w-md">
                <Carousel className="w-full">
                  <CarouselContent>
                    {[1, 2, 3].map((i) => (
                      <CarouselItem key={i}>
                        <div className="flex aspect-square items-center justify-center rounded-md border bg-muted p-6">
                          <span className="text-2xl font-semibold">{i}</span>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
              <div className="max-w-xs rounded-md border p-3">
                <Calendar mode="single" />
              </div>
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}

