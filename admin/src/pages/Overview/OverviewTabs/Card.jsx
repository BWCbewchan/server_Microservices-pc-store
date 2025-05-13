import React from 'react'
import CardItem from './CardItem'

const Card = () => {
  return (
    <div className="lg:flex lg:items-center lg:justify-between mt-9 ">

      <CardItem
        title="Total Revenue"
        value="$45,231.89"
        currency="💲"
        percentage="+20.1% from last month"
      />
      <CardItem
        title="Subscription"
        value="+2350"
        currency="👨‍👦"
        percentage="+180.1% from last month"
      />

      <CardItem
        title="Sales"
        value="+12.234"
        currency="🎫"
        percentage="+19% from last month"
      />

      <CardItem
        title="Active Now"
        value="$573"
        currency="✔"
        percentage="+201 since last hour"
      />


    </div>
  )
}

export default Card