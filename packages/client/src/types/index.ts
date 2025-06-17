export interface Canvasser {
  id: number;
  name: string;
  email: string;
}

export interface Voter {
  id: number;
  name: string;
  email: string | null;
  notes: string | null;
}
