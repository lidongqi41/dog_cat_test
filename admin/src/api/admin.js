import { request } from './client'

export function login(username, password) {
  return request('/admin/auth/login', {
    method: 'POST',
    body: { username, password }
  })
}

export function listSubmissions(params) {
  return request('/admin/submissions', { params })
}

export function getSubmission(id) {
  return request('/admin/submissions/' + id)
}

export function approveSubmission(id, body) {
  return request('/admin/submissions/' + id + '/approve', {
    method: 'POST',
    body: body || {}
  })
}

export function rejectSubmission(id, body) {
  return request('/admin/submissions/' + id + '/reject', {
    method: 'POST',
    body
  })
}

export function listAdoptions(params) {
  return request('/admin/adoptions', { params })
}

export function approveAdoption(id) {
  return request('/admin/adoptions/' + id + '/approve', { method: 'POST', body: {} })
}

export function rejectAdoption(id, reason) {
  return request('/admin/adoptions/' + id + '/reject', {
    method: 'POST',
    body: { reason: reason || '' }
  })
}

export function listAnimals(params) {
  return request('/admin/animals', { params })
}

export function createAnimal(body) {
  return request('/admin/animals', { method: 'POST', body })
}

export function updateAnimal(id, body) {
  return request('/admin/animals/' + id, { method: 'PUT', body })
}

export function deleteAnimal(id) {
  return request('/admin/animals/' + id, { method: 'DELETE' })
}