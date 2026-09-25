export type VotingLocation = { id: string; name: string; neighborhood: string; address?: string | null }

export type Neighborhood = {
  id: string
  name: string
  created_at: string
}

export type CaboRecord = {
  id: string
  user_id: string
  type: 'individual' | 'lote'
  quantity: number | null
  candidate_id: string | null
  name: string | null
  phone: string | null
  neighborhood: string | null
  voting_location: string | null
  created_at: string
  candidates?: { name: string } | { name: string }[] | null
}

export type CandidateRecord = {
  id: string
  name: string
  number: string
  role: string
  party: string | null
  created_at?: string
}

export type Candidate = CandidateRecord

export type VoterRecord = {
  id: string
  type: 'individual' | 'lote'
  quantity: number | null
  name: string
  phone: string | null
  neighborhood: string | null
  voting_location: string | null
  created_at: string
}

export type UserProfile = {
  id: string
  full_name: string
  role: string
  parent_id: string | null
  access_modules?: string[] | null
}
