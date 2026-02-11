import React, { useEffect, useRef, useState } from "react";
import Nav from "./Nav";
import CategoryCard from "./CategoryCard";
import { categories } from "../category";
import { FaChevronCircleLeft } from "react-icons/fa";
import { FaChevronCircleRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import FoodCard from "./FoodCard";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";

function UserDashboard() {
  const { currentCity, shopInMyCity, itemsInMyCity , searchItems } = useSelector((state) => state.user);
  const cateScrollRef = useRef();
  const shopScrollRef = useRef();
  const navigate = useNavigate()
  const [showLeftCateButton, setShowLeftCateButton] = useState(false);
  const [showRightCateButton, setShowRightCateButton] = useState(false);
  const [showLeftShopButton, setShowLeftShopButton] = useState(false);
  const [showRightShopButton, setShowRightShopButton] = useState(false);
  const [updatedItemsList,setUpdatedItemsList] = useState([])

  const handleFilterByCategory = (category) => {
    if(category == "All") {
      setUpdatedItemsList(itemsInMyCity)
    } else {
      const filteredList = itemsInMyCity?.filter(i => i.category === category)
      setUpdatedItemsList(filteredList)
    }
  }

  useEffect (() => {
    setUpdatedItemsList(itemsInMyCity)
  },[itemsInMyCity])

  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current;
    if (element) {
      setLeftButton(element.scrollLeft > 0);
      setRightButton(
        element.scrollLeft + element.clientWidth < element.scrollWidth
      );
    }
  };

  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction == "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };


  useEffect(() => {
  if (!cateScrollRef.current || !shopScrollRef.current) return;

  const cateScrollElem = cateScrollRef.current;
  const shopScrollElem = shopScrollRef.current;

  updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton);
  updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton);

  const handleCateScroll = () => {
    updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton);
  };

  const handleShopScroll = () => {
    updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton);
  };

  cateScrollElem.addEventListener('scroll', handleCateScroll);
  shopScrollElem.addEventListener('scroll', handleShopScroll);

  return () => {
    if (cateScrollElem) {
      cateScrollElem.removeEventListener('scroll', handleCateScroll);
      shopScrollElem.removeEventListener('scroll', handleShopScroll);
    }
  };
}, [categories]);


  return (
    <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-transparent overflow-y-auto">
      <Nav />

      {searchItems && searchItems.length > 0 && (
        <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-5 bg-white shadow-md rounded-2xl mt-4">
          <h1 className="text-white text-2xl sm:text-3xl font-semibold drop-shadow-lg bg-black/40 px-4 py-2 rounded-lg border-b-0">Search Results</h1>
          <div className="w-full h-auto flex flex-wrap gap-6 justify-center">
            {searchItems.map((item) => (
              <FoodCard data={item} key={item._id} />
            ))}
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <h1 className="text-white text-2xl sm:text-3xl font-bold drop-shadow-lg bg-black/40 px-4 py-2 rounded-lg">
          Inspiration For Your First Order
        </h1>
        <div className="w-full relative">
          {showLeftCateButton && (
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#00fb7d] text-black p-2 rounded-full shadow-lg hover:bg-[#00d965] z-10"
              onClick={() => scrollHandler(cateScrollRef, "left")}
            >
              <FaChevronCircleLeft />
            </button>
          )}
          <div
            className="w-full flex overflow-x-auto gap-4 pb-2"
            ref={cateScrollRef}
          >
            {categories.map((cate, index) => (
              <CategoryCard name={cate.category} image={cate.image} key={index} onClick={() => handleFilterByCategory(cate.category)}/>
            ))}
          </div>
          {showRightCateButton && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#00fb7d] text-black p-2 rounded-full shadow-lg hover:bg-[#00d965] z-10"
              onClick={() => scrollHandler(cateScrollRef, "right")}
            >
              <FaChevronCircleRight />
            </button>
          )}
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <h1 className="text-white text-2xl sm:text-3xl font-bold drop-shadow-lg bg-black/40 px-4 py-2 rounded-lg">
          Best Shop in {currentCity}
        </h1>

        <div className="w-full relative">
          {showLeftShopButton && (
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#00fb7d] text-black p-2 rounded-full shadow-lg hover:bg-[#00d965] z-10"
              onClick={() => scrollHandler(shopScrollRef, "left")}
            >
              <FaChevronCircleLeft />
            </button>
          )}
          <div
            className="w-full flex overflow-x-auto gap-4 pb-2"
            ref={shopScrollRef}
          >
            {shopInMyCity?.map((shop, index) => (
              // <CategoryCard name={shop.name} image={shop.image} key={index} onClick={() => handleFilterByCategory(cate.category)} />
              <CategoryCard name={shop.name} image={shop.image} key={index} onClick={() => navigate(`/shop/${shop._id}`)} />
            ))}
          </div>
          {showRightShopButton && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#00fb7d] text-black p-2 rounded-full shadow-lg hover:bg-[#00d965] z-10"
              onClick={() => scrollHandler(shopScrollRef, "right")}
            >
              <FaChevronCircleRight />
            </button>
          )}
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
          <h1 className="text-white text-2xl sm:text-3xl font-bold drop-shadow-lg bg-black/40 px-4 py-2 rounded-lg">Suggested Food Items</h1>

          <div className="w-full h-auto flex flex-wrap gap-[20px] justify-center">
            {updatedItemsList?.map((item,index) => (
              <FoodCard key={index} data={item} />
            ))}
          </div>
      </div>
    </div>
  );
}

export default UserDashboard;
