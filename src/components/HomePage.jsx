import SectionNav from "./SectionNav.jsx";
import SectionGallery from "./SectionGallery.jsx";
import SectionAboutUs from "./SectionAboutUs.jsx";
import { useEffect} from "react"
import { useLocation } from "react-router-dom";

export default function HomePage() {
    const location = useLocation();

    useEffect(() => {
        if(location.hash){
            const id = location.hash.replace("#", "");

            setTimeout(()=>{
                const el = document.getElementById(id);
                if(el){
                    el.scrollIntoView({behavior: "smooth"});
                }
            }, 100);
        } else{
            window.scrollTo({top:0, behavior: "smooth"});
        }
    }, [location])
    return (
        <>
            <img src="/images/modelImg.jpg" alt=""/>
            <div id="nav">
                <SectionNav />
            </div>
            <div id="gallery">
                <SectionGallery />
            </div>
            <div id="about">
                <SectionAboutUs />
            </div>
        </>
    )
}