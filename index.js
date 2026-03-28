app.post("/order", async (req, res) => {
  try {
    let order = new Order();

    order.name = req.body.name;
    order.email = req.body.email;
    order.address = req.body.address;
    order.mobile = req.body.mobile;
    order.items = req.body.order;
    order.total = req.body.total;
    order.time = req.body.time;
    order.payement_id = req.body.payement_id;
    order.order_id = req.body.order_id;

    await order.save();

    // Send mail
    await transporter.sendMail({
      from: "support@blogbeast.in",
      to: req.body.email,
      subject: `${req.body.name} - Order Placed - Lucky Shop`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Your order has been successfully placed.</p>
        <ul>
          ${req.body.order.map(item =>
            `<li>${item.name} - ${item.count} x ${item.rate}</li>`
          ).join("")}
        </ul>
        <p><strong>Total:</strong> ${req.body.total}</p>
      `,
    });

    res.json({ message: "success" }); // ✅ ONLY ONCE
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});
