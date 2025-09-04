import './list.scss'
import Card from"../card/Card"
import { useState } from 'react'

function List({posts}){
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 6

  const indexOfLastPost = currentPage * postsPerPage
  const indexOfFirstPost = indexOfLastPost - postsPerPage
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost)
  const totalPages = Math.ceil(posts.length / postsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <div className='list'>
      <div className='posts'>
        {currentPosts.map(item=>(
          <Card key={item.id} item={item}/>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className='pagination'>
          <button 
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className='pagination-btn'
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
            >
              {index + 1}
            </button>
          ))}
          
          <button 
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className='pagination-btn'
          >
            Next
          </button>
        </div>
      )}
      
      <div className='pagination-info'>
        Showing {indexOfFirstPost + 1}-{Math.min(indexOfLastPost, posts.length)} of {posts.length} properties
      </div>
    </div>
  )
}

export default List