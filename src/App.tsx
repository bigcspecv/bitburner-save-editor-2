import { useState } from 'react';
import {
  Button,
  Input,
  NumberInput,
  FileInput,
  Textarea,
  Checkbox,
  Select,
  MultiSelect,
  Card,
  Table,
  Modal,
  ConfirmModal,
  Tabs,
  Label,
} from './components/ui';

function App() {
  // Check URL for demo parameter (?demo=true or ?ui-demo)
  const isDemoFromUrl = new URLSearchParams(window.location.search).has('demo') ||
                        new URLSearchParams(window.location.search).has('ui-demo');

  // State management
  const [showComponentDemo, setShowComponentDemo] = useState(isDemoFromUrl);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saveLoaded, setSaveLoaded] = useState(false);
  const [numericValue, setNumericValue] = useState(100);
  const [selectedAugs, setSelectedAugs] = useState<string[]>([]);

  // Component demo
  if (showComponentDemo) {
    return (
      <div className="min-h-screen bg-black text-terminal-primary font-mono crt-scanlines">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-glow mb-2">
              &gt; BITBURNER SAVE EDITOR v2.0
            </h1>
            <p className="text-terminal-dim">[UI COMPONENT LIBRARY DEMO]</p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowComponentDemo(false)}
              className="mt-4"
            >
              Exit Demo Mode
            </Button>
          </header>

          {/* Component Showcase */}
          <Tabs
            tabs={[
              {
                id: 'buttons',
                label: 'Buttons',
                content: (
                  <div className="space-y-4">
                    <Card title="Button Variants">
                      <p className="text-xs text-terminal-dim mb-3">&lt;Button variant="primary|secondary|danger" /&gt;</p>
                      <div className="flex gap-4 flex-wrap">
                        <Button variant="primary">Primary Button</Button>
                        <Button variant="secondary">Secondary Button</Button>
                        <Button variant="danger">Danger Button</Button>
                        <Button disabled>Disabled Button</Button>
                      </div>
                    </Card>
                    <Card title="Button Sizes">
                      <p className="text-xs text-terminal-dim mb-3">&lt;Button size="sm|md|lg" /&gt;</p>
                      <div className="flex gap-4 items-center flex-wrap">
                        <Button size="sm">Small</Button>
                        <Button size="md">Medium</Button>
                        <Button size="lg">Large</Button>
                      </div>
                    </Card>
                  </div>
                ),
              },
              {
                id: 'inputs',
                label: 'Inputs',
                content: (
                  <div className="space-y-4">
                    <Card title="Input Fields">
                      <div className="space-y-4 max-w-md">
                        <div>
                          <div className="text-xs text-terminal-dim mb-1">&lt;Input /&gt;</div>
                          <Input label="Username" placeholder="Enter username..." />
                        </div>
                        <div>
                          <div className="text-xs text-terminal-dim mb-1">&lt;Input type="password" /&gt;</div>
                          <Input
                            label="Password"
                            type="password"
                            placeholder="Enter password..."
                          />
                        </div>
                        <div>
                          <div className="text-xs text-terminal-dim mb-1">&lt;Input type="email" error="..." /&gt;</div>
                          <Input
                            label="Email"
                            type="email"
                            error="Invalid email format"
                            defaultValue="invalid-email"
                          />
                        </div>
                        <div>
                          <div className="text-xs text-terminal-dim mb-1">&lt;Select options=&#123;[...]&#125; /&gt;</div>
                          <Select
                            label="Connected Server"
                            placeholder="Select server..."
                            options={[
                              { value: 'home', label: 'home' },
                              { value: 'n00dles', label: 'n00dles' },
                              { value: 'foodnstuff', label: 'foodnstuff' },
                              { value: 'sigma-cosmetics', label: 'sigma-cosmetics' },
                              { value: 'joesguns', label: 'joesguns' },
                              { value: 'nectar-net', label: 'nectar-net' },
                              { value: 'hong-fang-tea', label: 'hong-fang-tea' },
                              { value: 'harakiri-sushi', label: 'harakiri-sushi' },
                            ]}
                          />
                        </div>
                        <div>
                          <div className="text-xs text-terminal-dim mb-1">&lt;Textarea rows=&#123;4&#125; /&gt;</div>
                          <Textarea
                            label="Description"
                            placeholder="Enter description..."
                            rows={4}
                          />
                        </div>
                        <div>
                          <div className="text-xs text-terminal-dim mb-1">&lt;MultiSelect options=&#123;[...]&#125; /&gt;</div>
                          <MultiSelect
                            label="Augmentations"
                            placeholder="Search augmentations..."
                            options={[
                              { value: 'neuroflux', label: 'NeuroFlux Governor' },
                              { value: 'speech', label: 'Speech Processor Implant' },
                              { value: 'combat-rib', label: 'Combat Rib I' },
                              { value: 'bionic-arms', label: 'Bionic Arms' },
                              { value: 'cranial', label: 'Cranial Signal Processors' },
                              { value: 'wired', label: 'Wired Reflexes' },
                              { value: 'graphene', label: 'Graphene Bone Lacings' },
                              { value: 'synaptic', label: 'Synaptic Enhancement Implant' },
                            ]}
                            value={selectedAugs}
                            onChange={setSelectedAugs}
                          />
                        </div>
                        <div>
                          <div className="text-xs text-terminal-dim mb-1">&lt;FileInput accept=".json,.gz" /&gt;</div>
                          <FileInput
                            label="Upload File"
                            accept=".json,.gz"
                            buttonText="Browse Files"
                          />
                        </div>
                        <div>
                          <div className="text-xs text-terminal-dim mb-1">&lt;NumberInput min=&#123;1&#125; max=&#123;999&#125; /&gt;</div>
                          <NumberInput
                            label="Hacking Level"
                            value={numericValue}
                            onChange={setNumericValue}
                            min={1}
                            max={999}
                          />
                        </div>
                        <div>
                          <div className="text-xs text-terminal-dim mb-1">&lt;NumberInput showButtons=&#123;false&#125; /&gt;</div>
                          <NumberInput
                            label="Money (No Buttons)"
                            value={1000000}
                            onChange={() => {}}
                            showButtons={false}
                          />
                        </div>
                        <div>
                          <div className="text-xs text-terminal-dim mb-1">&lt;Checkbox /&gt;</div>
                          <Label>Preferences</Label>
                          <div className="space-y-2 mt-2">
                            <Checkbox label="Enable notifications" defaultChecked />
                            <Checkbox label="Auto-save" />
                            <Checkbox label="Disabled (always on)" defaultChecked disabled />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ),
              },
              {
                id: 'tables',
                label: 'Tables',
                content: (
                  <Card title="Data Table Example">
                    <p className="text-xs text-terminal-dim mb-3">&lt;Table&gt;&lt;Table.Header /&gt;&lt;Table.Row /&gt;&lt;Table.Cell /&gt;&lt;/Table&gt;</p>
                    <Table>
                      <thead>
                        <tr>
                          <Table.Header>Server</Table.Header>
                          <Table.Header>RAM (GB)</Table.Header>
                          <Table.Header>Security</Table.Header>
                          <Table.Header>Money</Table.Header>
                        </tr>
                      </thead>
                      <tbody>
                        <Table.Row>
                          <Table.Cell>home</Table.Cell>
                          <Table.Cell>256</Table.Cell>
                          <Table.Cell>1.00</Table.Cell>
                          <Table.Cell>$0</Table.Cell>
                        </Table.Row>
                        <Table.Row onClick={() => alert('Row clicked!')}>
                          <Table.Cell>n00dles</Table.Cell>
                          <Table.Cell>4</Table.Cell>
                          <Table.Cell>10.00</Table.Cell>
                          <Table.Cell>$1,750,000</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>foodnstuff</Table.Cell>
                          <Table.Cell>16</Table.Cell>
                          <Table.Cell>15.00</Table.Cell>
                          <Table.Cell>$50,000,000</Table.Cell>
                        </Table.Row>
                      </tbody>
                    </Table>
                  </Card>
                ),
              },
              {
                id: 'modals',
                label: 'Modals',
                content: (
                  <div className="space-y-4">
                    <Card title="Modal Dialogs">
                      <p className="text-xs text-terminal-dim mb-3">&lt;Modal /&gt; and &lt;ConfirmModal /&gt;</p>
                      <div className="flex gap-4">
                        <Button onClick={() => setModalOpen(true)}>
                          Open Modal
                        </Button>
                        <Button onClick={() => setConfirmOpen(true)}>
                          Open Confirm Dialog
                        </Button>
                      </div>
                    </Card>

                    <Modal
                      isOpen={modalOpen}
                      onClose={() => setModalOpen(false)}
                      title="Example Modal"
                      footer={
                        <>
                          <Button
                            variant="secondary"
                            onClick={() => setModalOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={() => setModalOpen(false)}>
                            Confirm
                          </Button>
                        </>
                      }
                    >
                      <p>
                        This is a terminal-styled modal dialog. You can close it
                        by pressing ESC or clicking outside.
                      </p>
                      <p className="mt-4">
                        Modals support custom footers with action buttons.
                      </p>
                    </Modal>

                    <ConfirmModal
                      isOpen={confirmOpen}
                      onClose={() => setConfirmOpen(false)}
                      onConfirm={() => alert('Confirmed!')}
                      title="Confirm Action"
                      message="Are you sure you want to proceed with this action?"
                      confirmText="Yes"
                      cancelText="No"
                    />
                  </div>
                ),
              },
              {
                id: 'cards',
                label: 'Cards',
                content: (
                  <div className="space-y-4">
                    <p className="text-xs text-terminal-dim">&lt;Card title="..." subtitle="..." actions=&#123;...&#125; /&gt;</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card title="Simple Card">
                        <p className="text-terminal-dim">
                          This is a basic card with a title.
                        </p>
                      </Card>
                      <Card
                        title="Card with Actions"
                        actions={
                          <>
                            <Button size="sm" variant="secondary">
                              Edit
                            </Button>
                            <Button size="sm" variant="danger">
                              Delete
                            </Button>
                          </>
                        }
                      >
                        <p className="text-terminal-dim">
                          Cards can have action buttons in the header.
                        </p>
                      </Card>
                      <Card title="Card with Subtitle" subtitle="Additional context">
                        <p className="text-terminal-dim">
                          Cards support optional subtitles.
                        </p>
                      </Card>
                      <Card>
                        <p className="text-terminal-dim">
                          Cards can also be used without a title.
                        </p>
                      </Card>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    );
  }

  // Normal app
  return (
    <div className="min-h-screen bg-black text-terminal-primary font-mono crt-scanlines">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-glow mb-2">
            &gt; BITBURNER SAVE EDITOR v2.0
          </h1>
          <p className="text-terminal-dim">[UNAUTHORIZED ACCESS GRANTED]</p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowComponentDemo(true)}
            className="mt-4 hidden-demo-btn"
          >
            View Component Demo
          </Button>
        </header>

        {/* Main Content */}
        {!saveLoaded ? (
          <Card title="Upload Save File" className="max-w-2xl mx-auto">
            <p className="mb-4 text-terminal-dim">
              Select your Bitburner save file (.json or .json.gz)
            </p>
            <FileInput
              accept=".json,.gz"
              buttonText="Select Save File"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  // TODO: Load save file
                  console.log('File selected:', e.target.files[0]);
                  setSaveLoaded(true);
                }
              }}
            />
          </Card>
        ) : (
          <Card title="Save Loaded">
            <p className="text-terminal-dim">Editor sections will go here...</p>
          </Card>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-terminal-dim text-sm">
          <p>&gt; Bitburner v2.8.1 Compatible</p>
          <p>&gt; Unauthorized modification of save files detected</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
