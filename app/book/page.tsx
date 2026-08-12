import BookingPanel from "../component/booking/BookingPanel";

export default function BookPage() {
  console.log("BookingPanel:", BookingPanel);
  console.log("BookingPanel type:", typeof BookingPanel);

  return <BookingPanel />;
}
