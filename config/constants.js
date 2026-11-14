/**
 * 业务常量
 */
const ANIMAL_TYPE_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'cat', label: '猫' },
  { value: 'dog', label: '狗' }
]

const ANIMAL_STATUS_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'available', label: '待领养' },
  { value: 'adopted', label: '已领养' }
]

const ANIMAL_STATUS = {
  available: { label: '待领养', color: 'green' },
  pending: { label: '审核中', color: 'orange' },
  adopted: { label: '已领养', color: 'gray' }
}

const ADOPTION_STATUS = {
  pending: { label: '待审核', color: 'orange' },
  approved: { label: '已通过', color: 'green' },
  rejected: { label: '已拒绝', color: 'red' },
  withdrawn: { label: '已撤销', color: 'gray' }
}

const ADOPTION_TABS = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'withdrawn', label: '已撤销' }
]

const SUBMISSION_STATUS = {
  pending: { label: '待审核', color: 'orange' },
  approved: { label: '已通过', color: 'green' },
  rejected: { label: '已驳回', color: 'red' },
  withdrawn: { label: '已撤回', color: 'gray' }
}

const SUBMISSION_TABS = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已驳回' },
  { value: 'withdrawn', label: '已撤回' }
]

const DOC_TYPES = {
  agreement: '用户协议',
  privacy: '隐私政策',
  'adopt-rule': '领养须知'
}

module.exports = {
  ANIMAL_TYPE_OPTIONS: ANIMAL_TYPE_OPTIONS,
  ANIMAL_STATUS_OPTIONS: ANIMAL_STATUS_OPTIONS,
  ANIMAL_STATUS: ANIMAL_STATUS,
  ADOPTION_STATUS: ADOPTION_STATUS,
  ADOPTION_TABS: ADOPTION_TABS,
  SUBMISSION_STATUS: SUBMISSION_STATUS,
  SUBMISSION_TABS: SUBMISSION_TABS,
  DOC_TYPES: DOC_TYPES
}