
export type AppState = 'asking' | 'success';

export interface Position {
  x: number;
  y: number;
}

export interface DateDetails {
  when: string;
  where: string;
  dressCode: string;
}
