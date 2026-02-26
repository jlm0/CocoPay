import { Icon } from '@/components/ui/icon';
import { NativeOnlyAnimatedView } from '@/components/ui/native-only-animated-view';
import { cn } from '@/lib/utils';
import * as DropdownMenuPrimitive from '@rn-primitives/dropdown-menu';
import { Check, ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { Platform, Text, View } from 'react-native';
import { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: DropdownMenuPrimitive.SubTriggerProps &
  React.RefAttributes<DropdownMenuPrimitive.SubTriggerRef>) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      className={cn(
        'native:py-2 flex flex-row items-center gap-2 px-2 py-1.5 active:bg-accent web:cursor-default web:select-none web:outline-none web:focus:bg-accent',
        className
      )}
      {...props}>
      <>{children}</>
      <Icon as={ChevronRight} className="ml-auto size-4 text-foreground" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: DropdownMenuPrimitive.SubContentProps &
  React.RefAttributes<DropdownMenuPrimitive.SubContentRef>) {
  return (
    <DropdownMenuPrimitive.SubContent
      className={cn(
        'z-50 mt-1 min-w-[8rem] overflow-hidden border-2 border-foreground bg-popover p-1 shadow-brutal-md',
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  portalHost,
  ...props
}: DropdownMenuPrimitive.ContentProps &
  React.RefAttributes<DropdownMenuPrimitive.ContentRef> & {
    portalHost?: string;
  }) {
  return (
    <DropdownMenuPortal hostName={portalHost}>
      <DropdownMenuPrimitive.Overlay
        className={cn(
          'absolute bottom-0 left-0 right-0 top-0 z-50',
          Platform.select({
            web: 'fixed',
          })
        )}
        style={{ backgroundColor: 'transparent' }}>
        <NativeOnlyAnimatedView entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)}>
          <DropdownMenuPrimitive.Content
            className={cn(
              'z-50 min-w-[8rem] overflow-hidden border-2 border-foreground bg-popover p-1 shadow-brutal-md',
              Platform.select({
                web: 'animate-in fade-in-0 zoom-in-95',
              }),
              className
            )}
            {...props}
            asChild={Platform.OS !== 'web'}>
            <NativeOnlyAnimatedView entering={ZoomIn.duration(150)} exiting={ZoomOut.duration(100)}>
              <>{props.children}</>
            </NativeOnlyAnimatedView>
          </DropdownMenuPrimitive.Content>
        </NativeOnlyAnimatedView>
      </DropdownMenuPrimitive.Overlay>
    </DropdownMenuPortal>
  );
}

function DropdownMenuItem({
  className,
  ...props
}: DropdownMenuPrimitive.ItemProps & React.RefAttributes<DropdownMenuPrimitive.ItemRef>) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'native:py-2 min-h-11 group relative flex flex-row items-center gap-2 px-2 py-1.5 active:bg-accent web:cursor-default web:select-none web:outline-none web:focus:bg-accent',
        props.disabled && 'opacity-50 web:pointer-events-none',
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: DropdownMenuPrimitive.CheckboxItemProps &
  React.RefAttributes<DropdownMenuPrimitive.CheckboxItemRef>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      className={cn(
        'native:py-2 min-h-11 group relative flex flex-row items-center py-1.5 pl-8 pr-2 active:bg-accent web:cursor-default web:select-none web:outline-none web:focus:bg-accent',
        props.disabled && 'opacity-50 web:pointer-events-none',
        className
      )}
      checked={checked}
      {...props}>
      <View className="absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Icon as={Check} className="size-4 text-foreground" />
        </DropdownMenuPrimitive.ItemIndicator>
      </View>
      <>{children}</>
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: DropdownMenuPrimitive.RadioItemProps & React.RefAttributes<DropdownMenuPrimitive.RadioItemRef>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      className={cn(
        'native:py-2 min-h-11 group relative flex flex-row items-center py-1.5 pl-8 pr-2 active:bg-accent web:cursor-default web:select-none web:outline-none web:focus:bg-accent',
        props.disabled && 'opacity-50 web:pointer-events-none',
        className
      )}
      {...props}>
      <View className="absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <View className="size-2 bg-foreground" />
        </DropdownMenuPrimitive.ItemIndicator>
      </View>
      <>{children}</>
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  ...props
}: DropdownMenuPrimitive.LabelProps & React.RefAttributes<DropdownMenuPrimitive.LabelRef>) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn('native:py-1.5 px-2 py-1.5 font-brutal uppercase text-sm text-foreground', className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuPrimitive.SeparatorProps & React.RefAttributes<DropdownMenuPrimitive.SeparatorRef>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Text>) {
  return (
    <Text
      className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
