'use client';
import { clearDirty } from '@/store/dirtySlice';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { confirmDialog } from 'primereact/confirmdialog';
import { useSelector, useDispatch } from 'react-redux';

export default function ConfirmLink({ href, children, ...props }) {
  const router = useRouter();
  const isDirty = useSelector(state => state.dirty);
  const dispatch = useDispatch();

  const onClick = e => {
    if (!isDirty) return;
    e.preventDefault();
    confirmDialog({
      message: 'You have unsaved changes. If you leave, they will be lost. Continue?',
      header: 'Confirm navigation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        dispatch(clearDirty());
        router.push(href);
      }
    });
  };

  return (
    <NextLink href={href} onClick={onClick} {...props}>
      {children}
    </NextLink>
  );
}
