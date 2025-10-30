import './list.scss'
import Card from"../card/Card"

function List({ posts, viewMode = "list" }) {
  return (
    <div className='list'>
      <div className={`posts${viewMode === "grid" ? " grid-view" : ""}`}>
        {posts.map(item=>(
          <Card key={item.id} item={item}/>
        ))}
      </div>
    </div>
  )
}

export default List