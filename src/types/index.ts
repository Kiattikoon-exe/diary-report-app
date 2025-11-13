// src/types/index.ts
export interface User {
  username: string;
  role: string;
  position?: string; // เพิ่มเผื่อไว้ใช้แสดงผล
  firstname?: string;
  lastname?: string;
}

export interface DocumentItem {
  document_id: number;
  report: string;
  nextfocus: string;
  status: '0' | '1';
  date: string;
  users: User;
  user_id: string;
}