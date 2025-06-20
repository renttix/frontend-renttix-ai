import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import axios from 'axios';
import { BaseURL } from '../../../utils/baseUrl';
import { useSelector } from 'react-redux';

const MaintenanceHistoryTest = ({ orderId }) => {
  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state?.authReducer);
  const toast = useRef(null);

  const createTestHistory = async () => {
    setLoading(true);
    try {
      const testData = {
        orderId,
        maintenanceConfigId: 'test-config-123',
        serviceDate: {
          scheduled: new Date(),
          started: new Date(),
          completed: new Date()
        },
        serviceDetails: {
          taskType: 'Routine Maintenance',
          priority: 'normal',
          duration: {
            planned: 60,
            actual: 75
          },
          description: 'Test maintenance service entry'
        },
        completionDetails: {
          completedBy: {
            userId: 'test-user-123',
            name: 'Test Technician',
            email: 'tech@test.com'
          },
          route: {
            routeId: 'route-123',
            routeName: 'Birmingham Route 1'
          },
          location: {
            address: '123 Test Street, Birmingham',
            coordinates: {
              lat: 52.4862,
              lng: -1.8904
            }
          }
        },
        serviceChecklist: [
          {
            item: 'Check equipment condition',
            checked: true,
            notes: 'Equipment in good condition'
          },
          {
            item: 'Clean and sanitize',
            checked: true,
            notes: 'Thoroughly cleaned'
          },
          {
            item: 'Test functionality',
            checked: true,
            notes: 'All functions working properly'
          },
          {
            item: 'Replace consumables',
            checked: false,
            notes: 'Not required this visit'
          }
        ],
        issues: [
          {
            type: 'minor_damage',
            severity: 'low',
            description: 'Small scratch on side panel',
            resolved: false
          }
        ],
        notes: {
          service: 'Routine maintenance completed successfully. Minor cosmetic damage noted.',
          followUp: 'Schedule paint touch-up on next visit'
        },
        customerInteraction: {
          present: true,
          name: 'John Smith',
          feedback: {
            rating: 5,
            comment: 'Excellent service, very professional'
          }
        },
        status: 'completed',
        actualDuration: 75
      };

      const response = await axios.post(
        `${BaseURL}/maintenance/history`,
        testData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Test maintenance history created',
      });
    } catch (error) {
      console.error('Error creating test history:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Failed to create test history',
      });
    } finally {
      setLoading(false);
    }
  };

  const createMultipleTestHistories = async () => {
    setLoading(true);
    try {
      const statuses = ['completed', 'completed', 'pending', 'in_progress', 'completed'];
      const taskTypes = ['Routine Maintenance', 'Emergency Repair', 'Preventive Check', 'Deep Cleaning', 'Safety Inspection'];
      const priorities = ['low', 'normal', 'high', 'urgent', 'normal'];
      
      for (let i = 0; i < 5; i++) {
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() - (i * 7)); // Weekly intervals
        
        const testData = {
          orderId,
          maintenanceConfigId: `test-config-${i}`,
          serviceDate: {
            scheduled: scheduledDate,
            started: statuses[i] !== 'pending' ? scheduledDate : null,
            completed: statuses[i] === 'completed' ? scheduledDate : null
          },
          serviceDetails: {
            taskType: taskTypes[i],
            priority: priorities[i],
            duration: {
              planned: 45 + (i * 15),
              actual: statuses[i] === 'completed' ? 50 + (i * 10) : null
            },
            description: `${taskTypes[i]} - Test entry ${i + 1}`
          },
          completionDetails: statuses[i] === 'completed' ? {
            completedBy: {
              userId: `tech-${i}`,
              name: `Technician ${i + 1}`,
              email: `tech${i}@test.com`
            },
            route: {
              routeId: `route-${i % 3}`,
              routeName: `Birmingham Route ${(i % 3) + 1}`
            }
          } : null,
          serviceChecklist: [
            {
              item: 'Initial inspection',
              checked: true,
              notes: 'Completed'
            },
            {
              item: 'Service performed',
              checked: statuses[i] === 'completed',
              notes: statuses[i] === 'completed' ? 'Done' : 'Pending'
            }
          ],
          issues: i % 2 === 0 ? [{
            type: i === 0 ? 'equipment_malfunction' : 'minor_damage',
            severity: i === 0 ? 'high' : 'low',
            description: i === 0 ? 'Equipment not starting properly' : 'Minor wear and tear',
            resolved: i === 0
          }] : [],
          customerInteraction: statuses[i] === 'completed' && i % 2 === 0 ? {
            present: true,
            name: `Customer ${i + 1}`,
            feedback: {
              rating: 4 + (i % 2),
              comment: `Service feedback for visit ${i + 1}`
            }
          } : null,
          status: statuses[i],
          actualDuration: statuses[i] === 'completed' ? 50 + (i * 10) : null
        };

        await axios.post(
          `${BaseURL}/maintenance/history`,
          testData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: '5 test maintenance histories created',
      });
    } catch (error) {
      console.error('Error creating test histories:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Failed to create test histories',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Card className="mb-4">
        <h4>Maintenance History Test Data</h4>
        <p className="text-gray-600 mb-4">
          Use these buttons to create test maintenance history entries for this order.
        </p>
        <div className="flex gap-2">
          <Button
            label="Create Single Test Entry"
            icon="pi pi-plus"
            onClick={createTestHistory}
            loading={loading}
            className="p-button-success"
          />
          <Button
            label="Create 5 Test Entries"
            icon="pi pi-plus-circle"
            onClick={createMultipleTestHistories}
            loading={loading}
            className="p-button-info"
          />
        </div>
      </Card>
    </>
  );
};

export default MaintenanceHistoryTest;