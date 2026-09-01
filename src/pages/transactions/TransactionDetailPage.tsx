import { useParams } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <div>
      <PageHeader title="Transaction" subtitle={id} />
    </div>
  )
}
