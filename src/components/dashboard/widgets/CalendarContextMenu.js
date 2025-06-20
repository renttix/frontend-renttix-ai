import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { ContextMenu } from 'primereact/contextmenu';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { reassignDriver, markJobOffHire } from '../../../store/slices/calendarSlice';
import { Toast } from 'primereact/toast';

const CalendarContextMenu = forwardRef(({ onEditJob }, ref) => {
  const cm = useRef(null);
  const toast = useRef(null);
  const dispatch = useDispatch();
  const router = useRouter();
  const selectedJobRef = useRef(null);

  const menuItems = [
    {
      label: 'View Details',
      icon: 'pi pi-eye',
      command: () => {
        if (selectedJobRef.current) {
          router.push(`/orders/${selectedJobRef.current.orderId}`);
        }
      }
    },
    {
      separator: true
    },
    {
      label: 'Edit Job',
      icon: 'pi pi-pencil',
      command: () => {
        if (selectedJobRef.current && onEditJob) {
          onEditJob(selectedJobRef.current);
        }
      }
    },
    {
      label: 'Reassign Driver',
      icon: 'pi pi-user',
      command: () => {
        if (selectedJobRef.current) {
          // This would typically open a dialog to select a new driver
          // For now, we'll just show a toast
          toast.current.show({
            severity: 'info',
            summary: 'Reassign Driver',
            detail: 'Driver reassignment dialog would open here',
            life: 3000
          });
        }
      }
    },
    {
      label: 'Mark Off-Hire',
      icon: 'pi pi-times-circle',
      command: () => {
        if (selectedJobRef.current) {
          const offHireDate = new Date();
          dispatch(markJobOffHire({
            jobId: selectedJobRef.current._id,
            offHireDate
          }))
          .unwrap()
          .then(() => {
            toast.current.show({
              severity: 'success',
              summary: 'Success',
              detail: 'Job marked as off-hire',
              life: 3000
            });
          })
          .catch((error) => {
            toast.current.show({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Failed to mark job as off-hire',
              life: 3000
            });
          });
        }
      }
    },
    {
      separator: true
    },
    {
      label: 'Print Job Sheet',
      icon: 'pi pi-print',
      command: () => {
        if (selectedJobRef.current) {
          window.open(`/api/jobs/${selectedJobRef.current._id}/print`, '_blank');
        }
      }
    },
    {
      label: 'Send SMS',
      icon: 'pi pi-mobile',
      command: () => {
        if (selectedJobRef.current) {
          toast.current.show({
            severity: 'info',
            summary: 'Send SMS',
            detail: 'SMS dialog would open here',
            life: 3000
          });
        }
      }
    },
    {
      separator: true
    },
    {
      label: 'Cancel Job',
      icon: 'pi pi-ban',
      className: 'p-menuitem-danger',
      command: () => {
        if (selectedJobRef.current) {
          toast.current.show({
            severity: 'warn',
            summary: 'Cancel Job',
            detail: 'Job cancellation confirmation would appear here',
            life: 3000
          });
        }
      }
    }
  ];

  const show = (event, job) => {
    selectedJobRef.current = job;
    cm.current.show(event);
  };

  const hide = () => {
    cm.current.hide();
  };

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    show,
    hide
  }));

  return (
    <>
      <Toast ref={toast} />
      <ContextMenu 
        ref={cm} 
        model={menuItems}
        onHide={() => selectedJobRef.current = null}
        breakpoint="767px"
      />
    </>
  );
});

CalendarContextMenu.displayName = 'CalendarContextMenu';

export default CalendarContextMenu;