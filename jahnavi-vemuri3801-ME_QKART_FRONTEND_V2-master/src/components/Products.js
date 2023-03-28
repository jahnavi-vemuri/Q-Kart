import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid, 
  InputAdornment, 
  TextField,    
} from "@mui/material"; 
import { Box } from "@mui/system";  
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import Cart,{generateCartItemsFrom} from "./Cart.js";

const Products=()=>{
  // const loggedIn = window.localStorage.getItem("username");
  const token = window.localStorage.getItem("token");
  // console.log("token :",token);
  const { enqueueSnackbar } = useSnackbar();

  const [product,setProduct]=useState([]);

  const [notFound,setnotFound]=useState(false);  

  const [loading, setLoading]=useState(false);

  const [productDetail,setProductDetail]=useState([]);

  const [debounceTimeout, setDebounceTimeout] = useState(
    setTimeout(() => {}, 500)
  );
  const [cartProducts,setcartProducts]=useState();
  useEffect(()=>{
    performAPICall();},[]);

  useEffect(() => {
    fetchCart(token);
    }, [productDetail]);

    
  const performAPICall = async () => {
    let api=`${config.endpoint}/products`;
    setLoading(true);
    await axios.get(api)
     .then(response=>{
      // console.log(response.data) 
      setProduct(response.data);
      setProductDetail(response.data);
      setLoading(false);
     })
     .catch(error=>{
       //console.log(error);     
        if(error.response.status>=400){
           enqueueSnackbar(error.response.data.message, {variant: 'error'});
           setLoading(false);
           }
           else
           {
             let msg="Something went wrong. Check that the backend is running, reachable and returns valid JSON.";
            enqueueSnackbar(msg, {variant: 'error'});
          }
        })
      }

      const performSearch = async (text) => {
        console.log(text);
        setLoading(true);
        setnotFound(false);
        await axios.get(`${config.endpoint}/products/search?value=${text}`)
        .then((response)=>{
          console.log(response.data);
          setProduct(response.data);
          setLoading(false);
          setnotFound(false);
        })
        .catch((e)=>{
          console.log(e);
          setnotFound(true);
          setLoading(false);
          // enqueueSnackbar("No products found",{variant:"error"});
        })
      };

      const handleSubmit = (event) => {
        debounceSearch(event, debounceTimeout);
      };

      const debounceSearch = (event, debounceTimeout) => {
        clearTimeout(debounceTimeout);
        setDebounceTimeout(
          setTimeout(() => {
            performSearch(event.target.value);
          }, 500)
        );
      };


      const fetchCart = async (token) => {
        if (!token) return;
          try {
             // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
             let response = await axios.get(`${config.endpoint}/cart`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            setcartProducts(generateCartItemsFrom(response.data, productDetail));
            console.log(response.data);
            //return response.data;
            } catch (e) {
              if (e.response && e.response.status === 400) {
                 enqueueSnackbar(e.response.data.message, { variant: "error" });
              } else {
                enqueueSnackbar(
                  "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
                  {
                    variant: "error",
                  }
                );
              }
               return null;
              }
      };

      const isItemInCart = (items, productId) => {
        for(let i=0;i<items.length;i++)
        {
          if(items[i].productId===productId)
          return true;
        }
        return false;
      };

      const handleQuantity = async (productId,qty,) => {
        try{
          let response=await axios.post(`${config.endpoint}/cart`,{'productId':productId, 'qty':qty},{
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },});
            setcartProducts(generateCartItemsFrom(response.data, productDetail));
            enqueueSnackbar("Item added to cart", { variant: "success" })
          }
          catch(e){
            if(e.response && e.response.status === 400) {
              enqueueSnackbar(e.response.data.message, { variant: "warning" });
            } else {
              enqueueSnackbar("Could not added product to Cart", { variant: "warning" });
            }
          }
      }
  
      const addToCart = async (
        token,
        items,
        products,
        productId,
        qty,
        options = { preventDuplicate: false }
      ) => {
        if(!token){
          enqueueSnackbar("Login to add an item to the Cart", {variant: 'warning'});
        }
        else{
          if(isItemInCart(items,productId)){
          enqueueSnackbar("Item already in cart. Use the cart sidebar to update quantity or remove item.", {variant: 'warning'});
          }
          else{
            try{
            let response=await axios.post(`${config.endpoint}/cart`,{'productId':productId, 'qty':qty},{
              headers: {
                Authorization: `Bearer ${token}`,
              },});
              setcartProducts(generateCartItemsFrom(response.data, productDetail));
              enqueueSnackbar("Item added to cart", { variant: "success" })
            }
            catch(e){
              if(e.response && e.response.status === 400) {
    
                enqueueSnackbar(e.response.data.message, { variant: "warning" });
    
              } else {
    
                enqueueSnackbar("Could not added product to Cart", { variant: "warning" });
    
              }
            }
          }
          // else if(options.preventDuplicate==='handleAdd'){
          //   items[index].qty++;
          // }
          // else{
          //   items[index].qty--;
          // }
      }
      // if(options.preventDuplicate===true){
      //   try{
      //     axios.post(`${config.endpoint}/cart`,{'productId':productId, 'qty':qty},{
      //       headers: {
      //         Authorization: `Bearer ${token}`,
      //       },});
      //   }
      //   catch{}
    
      // };
      };
  
  return (
    <div>
      <Header>
      <TextField
      className="search-desktop"
      size="small"
       //sx={{width: 300}}        
       InputProps={{
        sx:{width: 300},
        endAdornment: (
        <InputAdornment position="end">
        <Search color="primary" />
        </InputAdornment>
        ),
        }}
        onChange={handleSubmit}
        placeholder="Search for items/categories"
        name="search"
        />
      </Header> 

       {/* Search view for mobiles */}
       <TextField
       className="search-mobile"
       size="small"
       fullWidth
       InputProps={{
         endAdornment: (
         <InputAdornment position="end">
          <Search color="primary" />
        </InputAdornment>
        ),
      }}
      onChange={handleSubmit}
      placeholder="Search for items/categories"
      name="search"/>

      <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12 }}>
      <Grid item xs md >
        <Grid item className="product-grid">
          <Box className="hero">
            <p className="hero-heading">
              India's 
            <span className="hero-highlight">FASTEST DELIVERY</span>
            {" "}to your door step
            </p>
          </Box>
          </Grid>
          <>
          <Grid item md={12} mx={2} my={2}>
          <Grid container spacing={2}>
          {!(loading)? 
          ((notFound)?
          <Grid className='loading' item xs={12} md={12} direction="column">
             <SentimentDissatisfied/>
             <br/>
             <p align="center">No products found</p>
             </Grid>
            :
          product.map((prod)=><Grid item className="product-grid" xs={6} sm={3} md={3} key={prod._id}>
          <ProductCard product={prod} handleAddToCart={() => addToCart(token,cartProducts,productDetail,prod._id,1)}/>
          </Grid>))
          :
          <Grid className='loading' sx={{display:'flex'}} direction="column">
            <CircularProgress/>
            <br/>
            <p align='center'>Loading Products</p>
            </Grid>
            }
      </Grid>
      </Grid>
      </>
      </Grid>
      {(localStorage.getItem("username"))?
       <Grid item sm={12} md={3} my={2} bgcolor ="#E9F5E1">
        <Cart items={cartProducts} handleQuantity={handleQuantity}/>
        </Grid>
        :null
      }
      </Grid>
      <br/>
       {/* <ProductCard product={{
        "name":"Tan Leatherette Weekender Duffle",
        "category":"Fashion",
        "cost":150,
        "rating":4,
        "image":"https://crio-directus-assets.s3.ap-south-1.amazonaws.com/ff071a1c-1099-48f9-9b03-f858ccc53832.png",
        "_id":"PmInA797xJhMIPti"}}/> */}

      <Footer />
    </div>
  );
};

export default Products;



