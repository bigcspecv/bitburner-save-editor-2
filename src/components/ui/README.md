# UI Component Library

Terminal-styled component library for the Bitburner Save Editor. All components follow the Bitburner cyberpunk aesthetic with green terminal text on a black background.

## Components

### Button

Terminal-styled button with three variants and three sizes.

```tsx
import { Button } from './components/ui';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Disabled
<Button disabled>Disabled</Button>
```

### Input

Text input field with optional label and error state.

```tsx
import { Input } from './components/ui';

<Input
  label="Username"
  placeholder="Enter username..."
/>

<Input
  label="Email"
  type="email"
  error="Invalid email format"
  defaultValue="invalid@email"
/>
```

### Textarea

Multi-line text input with optional label and error state.

```tsx
import { Textarea } from './components/ui';

<Textarea
  label="Description"
  placeholder="Enter description..."
  rows={4}
/>

<Textarea
  error="Field is required"
/>
```

### Checkbox

Checkbox input with optional label.

```tsx
import { Checkbox } from './components/ui';

<Checkbox label="Enable notifications" defaultChecked />
<Checkbox label="Auto-save" />
<Checkbox label="Dark mode" disabled />
```

### Select

Dropdown select field with options.

```tsx
import { Select } from './components/ui';

<Select
  label="Choose option"
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ]}
/>

<Select
  error="Please select an option"
  options={options}
/>
```

### Label

Standalone label component with optional required indicator.

```tsx
import { Label } from './components/ui';

<Label>Field Name</Label>
<Label required>Required Field</Label>
```

### Card

Container component for related content with optional title, subtitle, and action buttons.

```tsx
import { Card, Button } from './components/ui';

<Card title="Simple Card">
  <p>Content goes here</p>
</Card>

<Card
  title="Card with Actions"
  actions={
    <>
      <Button size="sm">Edit</Button>
      <Button size="sm" variant="danger">Delete</Button>
    </>
  }
>
  <p>Content with action buttons</p>
</Card>

<Card title="Title" subtitle="Subtitle">
  <p>Card with subtitle</p>
</Card>
```

### Table

Data table with composable sub-components.

```tsx
import { Table } from './components/ui';

<Table>
  <thead>
    <tr>
      <Table.Header>Name</Table.Header>
      <Table.Header>Value</Table.Header>
    </tr>
  </thead>
  <tbody>
    <Table.Row>
      <Table.Cell>Item 1</Table.Cell>
      <Table.Cell>100</Table.Cell>
    </Table.Row>
    <Table.Row onClick={() => alert('Clicked!')}>
      <Table.Cell>Item 2</Table.Cell>
      <Table.Cell>200</Table.Cell>
    </Table.Row>
  </tbody>
</Table>
```

### Modal

Full-screen modal dialog with overlay.

```tsx
import { Modal, Button } from './components/ui';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md" // sm, md, lg, xl
  footer={
    <>
      <Button variant="secondary" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleConfirm}>
        Confirm
      </Button>
    </>
  }
>
  <p>Modal content goes here</p>
</Modal>
```

### ConfirmModal

Convenience wrapper for confirmation dialogs.

```tsx
import { ConfirmModal } from './components/ui';

<ConfirmModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleConfirm}
  title="Confirm Action"
  message="Are you sure you want to proceed?"
  confirmText="Yes"
  cancelText="No"
/>
```

### Tabs

Tabbed navigation between content panels.

```tsx
import { Tabs } from './components/ui';

// Uncontrolled (manages its own state)
<Tabs
  defaultTab="tab1"
  tabs={[
    {
      id: 'tab1',
      label: 'First Tab',
      content: <div>First tab content</div>,
    },
    {
      id: 'tab2',
      label: 'Second Tab',
      content: <div>Second tab content</div>,
    },
  ]}
/>

// Controlled (parent manages state)
import { ControlledTabs } from './components/ui';

<ControlledTabs
  activeTab={activeTab}
  onTabChange={setActiveTab}
  tabs={tabs}
/>
```

## Color Palette

```css
--terminal-bg: #000000          /* Black background */
--terminal-primary: #00ff00     /* Bright green */
--terminal-secondary: #adff2f   /* Yellow-green */
--terminal-dim: #008800         /* Dark green */
--terminal-glow: #00ff00        /* Glow effect */
```

## CRT Effects

The app includes scanline and text glow effects:

```tsx
// Apply scanlines to entire app
<div className="crt-scanlines">
  {/* Content with scanline overlay */}
</div>

// Apply text glow effect
<span className="text-glow">Glowing text</span>
```

## Component Demo

Run the app with `npm run dev` and you'll see a component demo mode showcasing all components. Toggle demo mode using the button in the header.

## Development Guidelines

1. **Maintain terminal aesthetic** - All components use green text on black background
2. **Use monospace font** - Apply `font-mono` class to all text
3. **Uppercase labels** - Use `uppercase tracking-wide` for labels and headers
4. **Terminal prefix** - Start titles/headers with `>` character
5. **Consistent spacing** - Use Tailwind spacing utilities (px-4, py-2, etc.)
6. **Focus states** - All interactive elements have terminal-styled focus states
7. **Hover effects** - Buttons and interactive elements change on hover
8. **Disabled states** - Disabled elements have reduced opacity

## Future Components

Potential additions:

- **Tooltip** - Hover tooltips with terminal styling
- **Progress Bar** - Loading/progress indicator
- **Badge** - Small status indicators
- **Alert/Toast** - Notification messages
- **Accordion** - Collapsible content sections
- **NumberInput** - Input with increment/decrement buttons
- **FileInput** - Styled file upload button
