COPY auth_user (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) FROM stdin;
1	testpassword1	2019-02-27 14:22:47.771115+03	t	starnapho	Naphlin	Akena	naphlina@devinit.org	t	t	2019-02-23 20:22:47.771115+03
2	testpassword1	2019-02-27 14:22:47.771115+03	t	edwin	Edwin	Edwin	edwin@devinit.org	t	t	2019-02-23 20:22:47.771115+03
3	testpassword1	2019-02-27 14:22:47.771115+03	t	kate	Kate	Kate	kate@devinit.org	t	t	2019-02-23 20:22:47.771115+03
4	testpassword1	2019-02-27 14:22:47.771115+03	t	alex	Alex	Miller	alex@devinit.org	t	t	2019-02-23 20:22:47.771115+03
\.


--
-- TOC entry 2527 (class 0 OID 0)
-- Dependencies: 228
-- Name: auth_user_id_seq; Type: SEQUENCE SET; Schema: user_mgnt; Owner: postgres
--

SELECT pg_catalog.setval('auth_user_id_seq', 4, true);