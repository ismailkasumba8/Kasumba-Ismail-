import { ActivityLog } from '../types';

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-09-16T12:05:22.000Z',
    status: 'SUCCESS',
    role: 'admin',
    action: 'Administrator Master Access',
    identifier: 'ismailkasumba8@gmail.com',
    details: 'Administrator Ismail Kasumba authenticated successfully into management control center.',
    ipAddress: '196.43.12.84',
    deviceInfo: 'Desktop (Chrome Windows / Masaka Office)'
  },
  {
    id: 'log-2',
    timestamp: '2026-09-16T11:42:15.000Z',
    status: 'SUCCESS',
    role: 'parent',
    action: 'Parent Report Card Access',
    identifier: 'BDN-7821',
    details: 'Report card viewed for Amara Nakato Kasumba (Senior 2 - Baobab). Guardian: Dr. Sarah Nabatanzi.',
    ipAddress: '41.210.142.19',
    deviceInfo: 'Mobile (Safari iPhone / MTN Uganda)'
  },
  {
    id: 'log-3',
    timestamp: '2026-09-16T11:18:40.000Z',
    status: 'FAILED',
    role: 'parent',
    action: 'Failed Parent Access Attempt',
    identifier: 'BDN-9844',
    details: 'Invalid student code entered: "BDN-9844". No matching learner record found in database.',
    ipAddress: '102.134.45.2',
    deviceInfo: 'Mobile (Chrome Android / Airtel Uganda)'
  },
  {
    id: 'log-4',
    timestamp: '2026-09-16T10:55:04.000Z',
    status: 'SUCCESS',
    role: 'teacher',
    action: 'Teacher Gradebook Access',
    identifier: 'Academic Staff',
    details: 'Teacher authenticated into continuous assessment gradebook (Sciences / Senior 2 marks).',
    ipAddress: '196.43.12.85',
    deviceInfo: 'Laptop (Chrome MacOS / Staff Room WiFi)'
  },
  {
    id: 'log-5',
    timestamp: '2026-09-16T10:14:12.000Z',
    status: 'FAILED',
    role: 'teacher',
    action: 'Failed Teacher Password Attempt',
    identifier: '••••••••',
    details: 'Incorrect password entered on Teacher Gradebook portal. Access denied.',
    ipAddress: '154.72.198.66',
    deviceInfo: 'Mobile (Chrome Android)'
  },
  {
    id: 'log-6',
    timestamp: '2026-09-16T09:30:51.000Z',
    status: 'SUCCESS',
    role: 'parent',
    action: 'Parent Report Card Access',
    identifier: 'BDN-4419',
    details: 'Report card viewed for Brian Mukasa (Senior 2 - Baobab). Guardian: Mr. Charles Mukasa.',
    ipAddress: '41.210.155.80',
    deviceInfo: 'Mobile (Samsung Browser / MTN Uganda)'
  },
  {
    id: 'log-7',
    timestamp: '2026-09-16T08:50:19.000Z',
    status: 'FAILED',
    role: 'admin',
    action: 'Failed Administrator Password Attempt',
    identifier: 'root***',
    details: 'Incorrect administrator password attempt on administrative gateway. Access denied.',
    ipAddress: '197.239.4.11',
    deviceInfo: 'Desktop (Firefox Windows)'
  },
  {
    id: 'log-8',
    timestamp: '2026-09-16T08:12:00.000Z',
    status: 'SUCCESS',
    role: 'parent',
    action: 'Parent Report Card Access',
    identifier: 'BDN-9032',
    details: 'Report card viewed for Chloe Namutebi (Senior 2 - Acacia). Guardian: Mrs. Grace Namutebi.',
    ipAddress: '102.134.88.190',
    deviceInfo: 'Tablet (iPad Safari)'
  }
];
