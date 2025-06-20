import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Steps } from 'primereact/steps';
import { Card } from 'primereact/card';
import { Carousel } from 'primereact/carousel';
import { Badge } from 'primereact/badge';
import { Checkbox } from 'primereact/checkbox';
import './QuickStartGuide.css';

const QuickStartGuide = ({ visible, onHide, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Tutorial steps
  const tutorialSteps = [
    {
      label: 'Welcome',
      icon: 'pi pi-home',
      content: 'welcome'
    },
    {
      label: 'Dashboard Overview',
      icon: 'pi pi-th-large',
      content: 'overview'
    },
    {
      label: 'Managing Widgets',
      icon: 'pi pi-cog',
      content: 'widgets'
    },
    {
      label: 'Customization',
      icon: 'pi pi-palette',
      content: 'customization'
    },
    {
      label: 'Tips & Shortcuts',
      icon: 'pi pi-bolt',
      content: 'tips'
    }
  ];

  // Widget descriptions
  const widgetDescriptions = [
    {
      type: 'calendar',
      name: 'Rental Calendar',
      icon: 'pi-calendar',
      description: 'View and manage all rental jobs across different routes and dates. Perfect for scheduling and route planning.',
      features: ['Drag & drop jobs', 'Filter by route', 'Week/month views']
    },
    {
      type: 'last-orders',
      name: 'Last Orders',
      icon: 'pi-shopping-cart',
      description: 'Keep track of your most recent orders. See order status, customer details, and amounts at a glance.',
      features: ['Real-time updates', 'Quick actions', 'Filter by status']
    },
    {
      type: 'todays-deliveries',
      name: "Today's Deliveries",
      icon: 'pi-truck',
      description: 'Monitor all deliveries and collections scheduled for today. Track progress by route and status.',
      features: ['Route grouping', 'Status tracking', 'Completion rates']
    },
    {
      type: 'overdue-rentals',
      name: 'Overdue Rentals',
      icon: 'pi-exclamation-triangle',
      description: 'Stay on top of overdue returns. Quickly identify and contact customers with outstanding rentals.',
      features: ['Days overdue', 'Customer contact', 'Quick actions']
    },
    {
      type: 'fleet-utilization',
      name: 'Fleet Utilization',
      icon: 'pi-percentage',
      description: 'Analyze your fleet performance with key metrics and trends. Optimize asset usage and identify opportunities.',
      features: ['Usage charts', 'Trend analysis', 'Category breakdown']
    },
    {
      type: 'customer-messages',
      name: 'Customer Messages',
      icon: 'pi-comments',
      description: 'Manage all customer communications in one place. Reply quickly and track conversation history.',
      features: ['Multi-channel', 'Quick reply', 'Priority filtering']
    }
  ];

  // Mark step as completed
  const markStepCompleted = (stepIndex) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
  };

  // Handle navigation
  const handleNext = () => {
    markStepCompleted(activeStep);
    if (activeStep < tutorialSteps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleComplete = () => {
    if (dontShowAgain) {
      localStorage.setItem('dashboardQuickStartCompleted', 'true');
    }
    onComplete && onComplete();
    onHide();
  };

  // Widget card template for carousel
  const widgetCardTemplate = (widget) => {
    return (
      <Card className="widget-description-card m-2">
        <div className="text-center">
          <i className={`pi ${widget.icon} text-4xl mb-3`} style={{ color: 'var(--primary-color)' }} />
          <h4 className="mb-2">{widget.name}</h4>
          <p className="text-color-secondary mb-3">{widget.description}</p>
          <div className="flex flex-wrap gap-2 justify-content-center">
            {widget.features.map((feature, idx) => (
              <Badge key={idx} value={feature} severity="info" />
            ))}
          </div>
        </div>
      </Card>
    );
  };

  // Render step content
  const renderStepContent = () => {
    switch (tutorialSteps[activeStep].content) {
      case 'welcome':
        return (
          <div className="quick-start-content welcome-content">
            <div className="text-center mb-4">
              <i className="pi pi-chart-bar text-6xl mb-3" style={{ color: 'var(--primary-color)' }} />
              <h2 className="mb-2">Welcome to Your New Dashboard!</h2>
              <p className="text-xl text-color-secondary">
                Let's take a quick tour to help you get the most out of your customizable dashboard.
              </p>
            </div>
            <div className="feature-highlights mt-5">
              <div className="grid">
                <div className="col-12 md:col-4">
                  <div className="text-center p-3">
                    <i className="pi pi-th-large text-3xl mb-2" style={{ color: 'var(--primary-color)' }} />
                    <h4>Modular Widgets</h4>
                    <p className="text-color-secondary">Choose from various widgets to build your perfect dashboard</p>
                  </div>
                </div>
                <div className="col-12 md:col-4">
                  <div className="text-center p-3">
                    <i className="pi pi-arrows-alt text-3xl mb-2" style={{ color: 'var(--primary-color)' }} />
                    <h4>Drag & Drop</h4>
                    <p className="text-color-secondary">Arrange widgets exactly how you want them</p>
                  </div>
                </div>
                <div className="col-12 md:col-4">
                  <div className="text-center p-3">
                    <i className="pi pi-save text-3xl mb-2" style={{ color: 'var(--primary-color)' }} />
                    <h4>Multiple Layouts</h4>
                    <p className="text-color-secondary">Create different layouts for different workflows</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'overview':
        return (
          <div className="quick-start-content overview-content">
            <h3 className="mb-3">Dashboard Overview</h3>
            <p className="mb-4">Your dashboard is divided into several key areas:</p>
            
            <div className="overview-sections">
              <div className="overview-section mb-3 p-3 surface-100 border-round">
                <h4 className="flex align-items-center gap-2">
                  <i className="pi pi-bars" />
                  Toolbar
                </h4>
                <p className="text-color-secondary ml-4">
                  Access edit mode, manage layouts, and view dashboard status
                </p>
              </div>
              
              <div className="overview-section mb-3 p-3 surface-100 border-round">
                <h4 className="flex align-items-center gap-2">
                  <i className="pi pi-th-large" />
                  Widget Grid
                </h4>
                <p className="text-color-secondary ml-4">
                  The main area where your widgets are displayed in a responsive grid
                </p>
              </div>
              
              <div className="overview-section mb-3 p-3 surface-100 border-round">
                <h4 className="flex align-items-center gap-2">
                  <i className="pi pi-pencil" />
                  Edit Mode
                </h4>
                <p className="text-color-secondary ml-4">
                  Enable edit mode to add, remove, or rearrange widgets
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 surface-200 border-round">
              <p className="m-0">
                <i className="pi pi-info-circle mr-2" />
                <strong>Tip:</strong> Your dashboard automatically saves changes to prevent data loss!
              </p>
            </div>
          </div>
        );

      case 'widgets':
        return (
          <div className="quick-start-content widgets-content">
            <h3 className="mb-3">Available Widgets</h3>
            <p className="mb-4">Explore the variety of widgets available for your dashboard:</p>
            
            <Carousel 
              value={widgetDescriptions} 
              itemTemplate={widgetCardTemplate}
              numVisible={1}
              numScroll={1}
              circular
              autoplayInterval={5000}
              className="widget-carousel"
            />
            
            <div className="mt-4 text-center">
              <p className="text-color-secondary">
                <i className="pi pi-info-circle mr-2" />
                Swipe or use arrows to explore all widgets
              </p>
            </div>
          </div>
        );

      case 'customization':
        return (
          <div className="quick-start-content customization-content">
            <h3 className="mb-3">Customization Options</h3>
            
            <div className="customization-features">
              <div className="feature-item mb-4">
                <h4 className="flex align-items-center gap-2 mb-2">
                  <i className="pi pi-arrows-alt text-primary" />
                  Drag & Drop
                </h4>
                <p className="text-color-secondary ml-4">
                  In edit mode, drag widgets to rearrange them. The grid will automatically adjust to fit your layout.
                </p>
              </div>
              
              <div className="feature-item mb-4">
                <h4 className="flex align-items-center gap-2 mb-2">
                  <i className="pi pi-expand text-primary" />
                  Resize Widgets
                </h4>
                <p className="text-color-secondary ml-4">
                  Some widgets can be resized. Look for the resize handle in the bottom-right corner when in edit mode.
                </p>
              </div>
              
              <div className="feature-item mb-4">
                <h4 className="flex align-items-center gap-2 mb-2">
                  <i className="pi pi-cog text-primary" />
                  Widget Settings
                </h4>
                <p className="text-color-secondary ml-4">
                  Many widgets have customizable settings. Click the settings icon on any widget to configure it.
                </p>
              </div>
              
              <div className="feature-item mb-4">
                <h4 className="flex align-items-center gap-2 mb-2">
                  <i className="pi pi-copy text-primary" />
                  Multiple Layouts
                </h4>
                <p className="text-color-secondary ml-4">
                  Create different layouts for different tasks. Switch between them instantly from the layout manager.
                </p>
              </div>
            </div>
          </div>
        );

      case 'tips':
        return (
          <div className="quick-start-content tips-content">
            <h3 className="mb-3">Tips & Keyboard Shortcuts</h3>
            
            <div className="tips-section mb-4">
              <h4 className="mb-3">Keyboard Shortcuts</h4>
              <div className="shortcuts-list">
                <div className="shortcut-item mb-2 p-2 surface-100 border-round">
                  <kbd>Ctrl/Cmd + E</kbd>
                  <span className="ml-3">Toggle Edit Mode</span>
                </div>
                <div className="shortcut-item mb-2 p-2 surface-100 border-round">
                  <kbd>Ctrl/Cmd + S</kbd>
                  <span className="ml-3">Save Changes</span>
                </div>
                <div className="shortcut-item mb-2 p-2 surface-100 border-round">
                  <kbd>Ctrl/Cmd + L</kbd>
                  <span className="ml-3">Open Layout Manager</span>
                </div>
                <div className="shortcut-item mb-2 p-2 surface-100 border-round">
                  <kbd>Esc</kbd>
                  <span className="ml-3">Exit Edit Mode</span>
                </div>
              </div>
            </div>
            
            <div className="pro-tips-section">
              <h4 className="mb-3">Pro Tips</h4>
              <ul className="pro-tips-list">
                <li className="mb-2">
                  <i className="pi pi-star-fill text-yellow-500 mr-2" />
                  Start with a few essential widgets and add more as needed
                </li>
                <li className="mb-2">
                  <i className="pi pi-star-fill text-yellow-500 mr-2" />
                  Create separate layouts for different times of day or tasks
                </li>
                <li className="mb-2">
                  <i className="pi pi-star-fill text-yellow-500 mr-2" />
                  Use widget settings to customize refresh intervals
                </li>
                <li className="mb-2">
                  <i className="pi pi-star-fill text-yellow-500 mr-2" />
                  Collapse widgets you don't need frequently to save space
                </li>
              </ul>
            </div>
            
            <div className="mt-4 p-3 surface-200 border-round text-center">
              <p className="m-0 font-bold">
                Ready to build your perfect dashboard? Let's get started! 🚀
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Dialog footer
  const dialogFooter = (
    <div className="flex justify-content-between align-items-center w-full">
      <div className="flex align-items-center">
        <Checkbox 
          inputId="dontShowAgain" 
          checked={dontShowAgain} 
          onChange={(e) => setDontShowAgain(e.checked)} 
        />
        <label htmlFor="dontShowAgain" className="ml-2">Don't show this again</label>
      </div>
      <div className="flex gap-2">
        <Button 
          label="Previous" 
          icon="pi pi-chevron-left" 
          onClick={handlePrevious}
          disabled={activeStep === 0}
          className="p-button-text"
        />
        {activeStep < tutorialSteps.length - 1 ? (
          <Button 
            label="Next" 
            icon="pi pi-chevron-right" 
            iconPos="right"
            onClick={handleNext}
          />
        ) : (
          <Button 
            label="Get Started" 
            icon="pi pi-check" 
            iconPos="right"
            onClick={handleComplete}
            className="p-button-success"
          />
        )}
      </div>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Dashboard Quick Start Guide"
      footer={dialogFooter}
      className="quick-start-dialog"
      style={{ width: '50vw' }}
      breakpoints={{ '960px': '75vw', '640px': '95vw' }}
      modal
      closable={false}
    >
      <div className="quick-start-container">
        <Steps 
          model={tutorialSteps} 
          activeIndex={activeStep} 
          onSelect={(e) => setActiveStep(e.index)}
          className="mb-4"
        />
        
        <div className="step-content">
          {renderStepContent()}
        </div>
        
        <div className="progress-indicator text-center mt-4">
          <small className="text-color-secondary">
            Step {activeStep + 1} of {tutorialSteps.length}
          </small>
        </div>
      </div>
    </Dialog>
  );
};

export default QuickStartGuide;